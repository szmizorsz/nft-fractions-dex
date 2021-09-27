// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./INftFractionsRepository.sol";

contract DexBase is
    Initializable,
    PausableUpgradeable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    enum Side {
        BUY,
        SELL
    }

    struct Order {
        uint256 id;
        address trader;
        Side side;
        uint256 tokenId;
        uint256 amount;
        uint256 filled;
        uint256 price;
        uint256 date;
    }

    CountersUpgradeable.Counter private _orderIds;
    CountersUpgradeable.Counter private _tradeIds;
    mapping(address => uint256) ethBalance;
    mapping(address => uint256) ethReservedBalance;
    mapping(uint256 => mapping(uint256 => Order[])) orderBook;
    mapping(address => mapping(uint256 => uint256)) sharesReserved;
    INftFractionsRepository nftFractionsRepository;

    function __DexBase_init() public initializer {
        __Context_init_unchained();
        __Pausable_init_unchained();
        __Ownable_init_unchained();
    }

    function setNftFractionsRepository(address nftFractionsRepositoryAddress)
        public
        onlyOwner
    {
        nftFractionsRepository = INftFractionsRepository(
            nftFractionsRepositoryAddress
        );
    }

    /**
     * @dev deposit ETH for trading
     */
    function depositEth() public payable {
        require(!paused(), "Not allowed while paused");
        ethBalance[msg.sender] += msg.value;

        _onEthBalanceChange(msg.sender, ethBalance[msg.sender]);
    }

    /**
     * @dev Withdraw ETH
     *
     * Requirements:
     * - msg.sender has to have equal or more ETH than the amount to withdraw
     */
    function withdrawEth(uint256 amount) public nonReentrant {
        require(!paused(), "Not allowed while paused");
        require(
            ethBalance[msg.sender] - ethReservedBalance[msg.sender] >= amount,
            "ETH balance is not enough"
        );
        ethBalance[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);

        _onEthBalanceChange(msg.sender, ethBalance[msg.sender]);
    }

    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Creates a limit order
     *
     * Requirements:
     * - in case of sell: msg.sender has to have sufficient shares available for selling
     * - in case of buy: msg.sender has to have sufficient ETH deposited
     *
     * The relevant hooks are called: _onOrderUpsert, _onSharesReservedChange, _onEthReservedBalanceChange
     */
    function createLimitOrder(
        uint256 tokenId,
        uint256 amount,
        uint256 price,
        Side side
    ) external tokenExist(tokenId) {
        require(!paused(), "Not allowed while paused");
        if (side == Side.SELL) {
            uint256 sendersBalance = nftFractionsRepository.balanceOf(
                msg.sender,
                tokenId
            );
            require(
                sendersBalance >= amount,
                "message sender's token balance is too low"
            );
            sharesReserved[msg.sender][tokenId] += amount;
            _onSharesReservedChange(
                msg.sender,
                tokenId,
                sharesReserved[msg.sender][tokenId]
            );
        } else {
            uint256 totalFractionsAmount;
            totalFractionsAmount = nftFractionsRepository
                .getTotalFractionsAmount(tokenId);
            require(
                totalFractionsAmount >= amount,
                "total amount of fractions is lower than the given amount"
            );
            require(
                ethBalance[msg.sender] - ethReservedBalance[msg.sender] >=
                    amount * price,
                "eth balance too low"
            );
            ethReservedBalance[msg.sender] += amount * price;
            _onEthReservedBalanceChange(
                msg.sender,
                ethReservedBalance[msg.sender]
            );
        }
        Order[] storage orders = orderBook[tokenId][uint256(side)];
        _orderIds.increment();
        uint256 newOrderId = _orderIds.current();
        orders.push(
            Order(
                newOrderId,
                msg.sender,
                side,
                tokenId,
                amount,
                0,
                price,
                block.timestamp
            )
        );
        _onOrderUpsert(
            newOrderId,
            msg.sender,
            side,
            tokenId,
            amount,
            0,
            price,
            block.timestamp
        );

        uint256 i = orders.length > 0 ? orders.length - 1 : 0;
        while (i > 0) {
            if (side == Side.BUY && orders[i - 1].price > orders[i].price) {
                break;
            }
            if (side == Side.SELL && orders[i - 1].price < orders[i].price) {
                break;
            }
            Order memory order = orders[i - 1];
            orders[i - 1] = orders[i];
            orders[i] = order;
            i--;
        }
    }

    /**
     * @dev Creates a market order and executes against the registered limit orders
     *
     * Requirements:
     * - in case of sell: msg.sender has to have sufficient shares available for selling
     * - in case of buy: msg.sender has to have sufficient ETH deposited
     *
     * The relevant hooks are called: _onTradeExecution, _onOrderUpsert, _onSharesReservedChange, _onEthReservedBalanceChange, _onEthBalanceChange
     */
    function createMarketOrder(
        uint256 tokenId,
        uint256 amount,
        Side side
    ) external nonReentrant tokenExist(tokenId) {
        require(!paused(), "Not allowed while paused");
        if (side == Side.SELL) {
            uint256 sendersBalance = nftFractionsRepository.balanceOf(
                msg.sender,
                tokenId
            );
            require(
                sendersBalance >= amount,
                "message sender's token balance is too low"
            );
        }
        Order[] storage orders = orderBook[tokenId][
            uint256(side == Side.BUY ? Side.SELL : Side.BUY)
        ];
        uint256 i;
        uint256 remaining = amount;

        while (i < orders.length && remaining > 0) {
            uint256 available = orders[i].amount - orders[i].filled;
            uint256 matched = (remaining > available) ? available : remaining;
            remaining = remaining - matched;
            orders[i].filled = orders[i].filled + matched;
            _tradeIds.increment();
            uint256 newTradeId = _tradeIds.current();
            _onTradeExecution(
                newTradeId,
                orders[i].id,
                tokenId,
                orders[i].trader,
                msg.sender,
                matched,
                orders[i].price,
                block.timestamp
            );
            _onOrderUpsert(
                orders[i].id,
                orders[i].trader,
                orders[i].side,
                orders[i].tokenId,
                orders[i].amount,
                orders[i].filled,
                orders[i].price,
                block.timestamp
            );
            if (side == Side.SELL) {
                nftFractionsRepository.transferFrom(
                    msg.sender,
                    orders[i].trader,
                    tokenId,
                    matched,
                    ""
                );
                ethBalance[msg.sender] += orders[i].price * matched;
                ethBalance[orders[i].trader] -= orders[i].price * matched;
                ethReservedBalance[orders[i].trader] -=
                    orders[i].price *
                    matched;
                _onEthReservedBalanceChange(
                    orders[i].trader,
                    ethReservedBalance[orders[i].trader]
                );
            }
            if (side == Side.BUY) {
                require(
                    ethBalance[msg.sender] - ethReservedBalance[msg.sender] >=
                        orders[i].price * matched,
                    "eth balance too low"
                );
                nftFractionsRepository.transferFrom(
                    orders[i].trader,
                    msg.sender,
                    tokenId,
                    matched,
                    ""
                );
                ethBalance[msg.sender] -= orders[i].price * matched;
                ethBalance[orders[i].trader] += orders[i].price * matched;
                sharesReserved[orders[i].trader][tokenId] -= matched;
                _onSharesReservedChange(
                    orders[i].trader,
                    tokenId,
                    sharesReserved[orders[i].trader][tokenId]
                );
            }
            _onEthBalanceChange(msg.sender, ethBalance[msg.sender]);
            _onEthBalanceChange(orders[i].trader, ethBalance[orders[i].trader]);
            i++;
        }

        i = 0;
        while (i < orders.length && orders[i].filled == orders[i].amount) {
            _onOrderRemoval(orders[i].id);
            for (uint256 j = i; j < orders.length - 1; j++) {
                orders[j] = orders[j + 1];
            }
            orders.pop();
            i++;
        }
    }

    /**
     * @dev delete the order
     */
    function deleteOrder(
        uint256 tokenId,
        Side side,
        uint256 orderId
    ) public {
        Order[] storage orders = orderBook[tokenId][uint256(side)];
        for (uint256 i = 0; i < orders.length; i++) {
            if (orders[i].id == orderId) {
                require(
                    msg.sender == orders[i].trader,
                    "Only the trader can delete his order"
                );
                if (orders[i].side == Side.BUY) {
                    ethReservedBalance[msg.sender] -=
                        orders[i].amount *
                        orders[i].price;
                    _onEthReservedBalanceChange(
                        msg.sender,
                        ethReservedBalance[msg.sender]
                    );
                } else {
                    sharesReserved[msg.sender][tokenId] -= orders[i].amount;
                    _onSharesReservedChange(
                        msg.sender,
                        tokenId,
                        sharesReserved[msg.sender][tokenId]
                    );
                }
                orders[i] = orders[orders.length - 1];
                orders.pop();
                _onOrderRemoval(orderId);
            }
        }
    }

    modifier tokenExist(uint256 tokenId) {
        address erc721ContractAddress;
        (erc721ContractAddress) = nftFractionsRepository
            .getErc721ContractAddress(tokenId);
        require(
            erc721ContractAddress != address(0),
            "this token does not exist"
        );
        _;
    }

    /**
     * @dev hook function that is called when an order is created or updated
     */
    function _onOrderUpsert(
        uint256 orderId,
        address trader,
        Side side,
        uint256 tokenId,
        uint256 amount,
        uint256 filled,
        uint256 price,
        uint256 timestamp
    ) internal virtual {}

    /**
     * @dev hook function that is called when an order is deleted
     */
    function _onOrderRemoval(uint256 orderId) internal virtual {}

    /**
     * @dev hook function that is called when a traded happened
     */
    function _onTradeExecution(
        uint256 tradeId,
        uint256 orderId,
        uint256 tokenId,
        address trader1,
        address trader2,
        uint256 matchedAmount,
        uint256 price,
        uint256 timestamp
    ) internal virtual {}

    /**
     * @dev hook function that is called when an account's balance has changed in a trade
     */
    function _onEthBalanceChange(address account, uint256 balance)
        internal
        virtual
    {}

    /**
     * @dev hook function that is called when an account's reserved balance has changed, e.g.:
     * - created a buy order (so the necessary ETH has been reserved)
     * - the buy order has executed
     * - the order has been deleted
     */
    function _onEthReservedBalanceChange(
        address account,
        uint256 reservedBalance
    ) internal virtual {}

    /**
     * @dev hook function that is called when an account's token shares reserved balance has changed, e.g.:
     * - created a sell order (so the shares are reserved)
     * - the sell order has executed
     * - the order has been deleted
     */
    function _onSharesReservedChange(
        address account,
        uint256 tokenId,
        uint256 sharesReservedBalance
    ) internal virtual {}
}
