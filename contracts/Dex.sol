// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./NftFractionsRepository.sol";

contract Dex is Initializable, PausableUpgradeable, OwnableUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    enum Side {BUY, SELL}

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
    mapping(address => uint256) ethBalance;
    mapping(uint256 => mapping(uint256 => Order[])) orderBook;
    NftFractionsRepository nftFractionsRepository;

    function initialize() public initializer {
        __Context_init_unchained();
        __Pausable_init_unchained();
        __Ownable_init_unchained();
    }

    function setNftFractionsRepository(address nftFractionsRepositoryAddress)
        public
        onlyOwner()
    {
        nftFractionsRepository = NftFractionsRepository(
            nftFractionsRepositoryAddress
        );
    }

    /**
     * @dev deposit ETH for trading
     */
    function depositEth() public payable {
        ethBalance[msg.sender] += msg.value;
    }

    /**
     * @dev Withdraw ETH
     *
     * Requirements:
     * - msg.sender has to have equal or more ETH than the amount to withdraw
     */
    function withdrawEth(uint256 amount) public {
        require(ethBalance[msg.sender] >= amount, "ETH balance is not enough");
        ethBalance[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    /**
     * @dev returns the ETH balance of the owner
     */
    function getEthBalance(address owner) public view returns (uint256) {
        return ethBalance[owner];
    }

    function pause() public onlyOwner() {
        _pause();
    }

    function createLimitOrder(
        uint256 tokenId,
        uint256 amount,
        uint256 price,
        Side side
    ) external tokenExist(tokenId) {
        if (side == Side.SELL) {
            uint256 sendersBalance =
                nftFractionsRepository.balanceOf(msg.sender, tokenId);
            require(
                sendersBalance >= amount,
                "message sender's token balance is too low"
            );
        } else {
            address erc721ContractAddress;
            uint256 erc721TokenId;
            uint256 totalFractionsAmount;
            (
                erc721ContractAddress,
                erc721TokenId,
                totalFractionsAmount
            ) = nftFractionsRepository.getTokenData(tokenId);
            require(
                totalFractionsAmount >= amount,
                "total amount of fractions is lower than the given amount"
            );
            require(
                ethBalance[msg.sender] >= amount * price,
                "eth balance too low"
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

    function getOrders(uint256 tokenId, Side side)
        external
        view
        returns (Order[] memory)
    {
        return orderBook[tokenId][uint256(side)];
    }

    modifier tokenExist(uint256 tokenId) {
        address erc721ContractAddress;
        uint256 erc721TokenId;
        uint256 totalFractionsAmount;
        (
            erc721ContractAddress,
            erc721TokenId,
            totalFractionsAmount
        ) = nftFractionsRepository.getTokenData(tokenId);
        require(
            erc721ContractAddress != address(0),
            "this token does not exist"
        );
        _;
    }
}
