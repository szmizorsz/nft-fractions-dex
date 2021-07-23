// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[EIP].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165Upgradeable {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}


// solhint-disable-next-line compiler-version






/**
 * @dev Collection of functions related to the address type
 */
library AddressUpgradeable {
    /**
     * @dev Returns true if `account` is a contract.
     *
     * [IMPORTANT]
     * ====
     * It is unsafe to assume that an address for which this function returns
     * false is an externally-owned account (EOA) and not a contract.
     *
     * Among others, `isContract` will return false for the following
     * types of addresses:
     *
     *  - an externally-owned account
     *  - a contract in construction
     *  - an address where a contract will be created
     *  - an address where a contract lived, but was destroyed
     * ====
     */
    function isContract(address account) internal view returns (bool) {
        // This method relies on extcodesize, which returns 0 for contracts in
        // construction, since the code is only stored at the end of the
        // constructor execution.

        uint256 size;
        // solhint-disable-next-line no-inline-assembly
        assembly { size := extcodesize(account) }
        return size > 0;
    }

    /**
     * @dev Replacement for Solidity's `transfer`: sends `amount` wei to
     * `recipient`, forwarding all available gas and reverting on errors.
     *
     * https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
     * of certain opcodes, possibly making contracts go over the 2300 gas limit
     * imposed by `transfer`, making them unable to receive funds via
     * `transfer`. {sendValue} removes this limitation.
     *
     * https://diligence.consensys.net/posts/2019/09/stop-using-soliditys-transfer-now/[Learn more].
     *
     * IMPORTANT: because control is transferred to `recipient`, care must be
     * taken to not create reentrancy vulnerabilities. Consider using
     * {ReentrancyGuard} or the
     * https://solidity.readthedocs.io/en/v0.5.11/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
     */
    function sendValue(address payable recipient, uint256 amount) internal {
        require(address(this).balance >= amount, "Address: insufficient balance");

        // solhint-disable-next-line avoid-low-level-calls, avoid-call-value
        (bool success, ) = recipient.call{ value: amount }("");
        require(success, "Address: unable to send value, recipient may have reverted");
    }

    /**
     * @dev Performs a Solidity function call using a low level `call`. A
     * plain`call` is an unsafe replacement for a function call: use this
     * function instead.
     *
     * If `target` reverts with a revert reason, it is bubbled up by this
     * function (like regular Solidity function calls).
     *
     * Returns the raw returned data. To convert to the expected return value,
     * use https://solidity.readthedocs.io/en/latest/units-and-global-variables.html?highlight=abi.decode#abi-encoding-and-decoding-functions[`abi.decode`].
     *
     * Requirements:
     *
     * - `target` must be a contract.
     * - calling `target` with `data` must not revert.
     *
     * _Available since v3.1._
     */
    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
      return functionCall(target, data, "Address: low-level call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`], but with
     * `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCall(address target, bytes memory data, string memory errorMessage) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but also transferring `value` wei to `target`.
     *
     * Requirements:
     *
     * - the calling contract must have an ETH balance of at least `value`.
     * - the called Solidity function must be `payable`.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(address target, bytes memory data, uint256 value) internal returns (bytes memory) {
        return functionCallWithValue(target, data, value, "Address: low-level call with value failed");
    }

    /**
     * @dev Same as {xref-Address-functionCallWithValue-address-bytes-uint256-}[`functionCallWithValue`], but
     * with `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(address target, bytes memory data, uint256 value, string memory errorMessage) internal returns (bytes memory) {
        require(address(this).balance >= value, "Address: insufficient balance for call");
        require(isContract(target), "Address: call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = target.call{ value: value }(data);
        return _verifyCallResult(success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
        return functionStaticCall(target, data, "Address: low-level static call failed");
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(address target, bytes memory data, string memory errorMessage) internal view returns (bytes memory) {
        require(isContract(target), "Address: static call to non-contract");

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = target.staticcall(data);
        return _verifyCallResult(success, returndata, errorMessage);
    }

    function _verifyCallResult(bool success, bytes memory returndata, string memory errorMessage) private pure returns(bytes memory) {
        if (success) {
            return returndata;
        } else {
            // Look for revert reason and bubble it up if present
            if (returndata.length > 0) {
                // The easiest way to bubble the revert reason is using memory via assembly

                // solhint-disable-next-line no-inline-assembly
                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert(errorMessage);
            }
        }
    }
}


/**
 * @dev This is a base contract to aid in writing upgradeable contracts, or any kind of contract that will be deployed
 * behind a proxy. Since a proxied contract can't have a constructor, it's common to move constructor logic to an
 * external initializer function, usually called `initialize`. It then becomes necessary to protect this initializer
 * function so it can only be called once. The {initializer} modifier provided by this contract will have this effect.
 *
 * TIP: To avoid leaving the proxy in an uninitialized state, the initializer function should be called as early as
 * possible by providing the encoded function call as the `_data` argument to {UpgradeableProxy-constructor}.
 *
 * CAUTION: When used with inheritance, manual care must be taken to not invoke a parent initializer twice, or to ensure
 * that all initializers are idempotent. This is not verified automatically as constructors are by Solidity.
 */
abstract contract Initializable {

    /**
     * @dev Indicates that the contract has been initialized.
     */
    bool private _initialized;

    /**
     * @dev Indicates that the contract is in the process of being initialized.
     */
    bool private _initializing;

    /**
     * @dev Modifier to protect an initializer function from being invoked twice.
     */
    modifier initializer() {
        require(_initializing || !_initialized, "Initializable: contract is already initialized");

        bool isTopLevelCall = !_initializing;
        if (isTopLevelCall) {
            _initializing = true;
            _initialized = true;
        }

        _;

        if (isTopLevelCall) {
            _initializing = false;
        }
    }
}








/**
 * @title Counters
 * @author Matt Condon (@shrugs)
 * @dev Provides counters that can only be incremented or decremented by one. This can be used e.g. to track the number
 * of elements in a mapping, issuing ERC721 ids, or counting request ids.
 *
 * Include with `using Counters for Counters.Counter;`
 */
library CountersUpgradeable {
    struct Counter {
        // This variable should never be directly accessed by users of the library: interactions must be restricted to
        // the library's function. As of Solidity v0.5.2, this cannot be enforced, though there is a proposal to add
        // this feature: see https://github.com/ethereum/solidity/issues/4637
        uint256 _value; // default: 0
    }

    function current(Counter storage counter) internal view returns (uint256) {
        return counter._value;
    }

    function increment(Counter storage counter) internal {
        unchecked {
            counter._value += 1;
        }
    }

    function decrement(Counter storage counter) internal {
        uint256 value = counter._value;
        require(value > 0, "Counter: decrement overflow");
        unchecked {
            counter._value = value - 1;
        }
    }
}














/*
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract ContextUpgradeable is Initializable {
    function __Context_init() internal initializer {
        __Context_init_unchained();
    }

    function __Context_init_unchained() internal initializer {
    }
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
        return msg.data;
    }
    uint256[50] private __gap;
}



/**
 * @dev Contract module which allows children to implement an emergency stop
 * mechanism that can be triggered by an authorized account.
 *
 * This module is used through inheritance. It will make available the
 * modifiers `whenNotPaused` and `whenPaused`, which can be applied to
 * the functions of your contract. Note that they will not be pausable by
 * simply including this module, only once the modifiers are put in place.
 */
abstract contract PausableUpgradeable is Initializable, ContextUpgradeable {
    /**
     * @dev Emitted when the pause is triggered by `account`.
     */
    event Paused(address account);

    /**
     * @dev Emitted when the pause is lifted by `account`.
     */
    event Unpaused(address account);

    bool private _paused;

    /**
     * @dev Initializes the contract in unpaused state.
     */
    function __Pausable_init() internal initializer {
        __Context_init_unchained();
        __Pausable_init_unchained();
    }

    function __Pausable_init_unchained() internal initializer {
        _paused = false;
    }

    /**
     * @dev Returns true if the contract is paused, and false otherwise.
     */
    function paused() public view virtual returns (bool) {
        return _paused;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    modifier whenNotPaused() {
        require(!paused(), "Pausable: paused");
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    modifier whenPaused() {
        require(paused(), "Pausable: not paused");
        _;
    }

    /**
     * @dev Triggers stopped state.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    function _pause() internal virtual whenNotPaused {
        _paused = true;
        emit Paused(_msgSender());
    }

    /**
     * @dev Returns to normal state.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    function _unpause() internal virtual whenPaused {
        _paused = false;
        emit Unpaused(_msgSender());
    }
    uint256[49] private __gap;
}









/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract OwnableUpgradeable is Initializable, ContextUpgradeable {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    function __Ownable_init() internal initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
    }

    function __Ownable_init_unchained() internal initializer {
        address msgSender = _msgSender();
        _owner = msgSender;
        emit OwnershipTransferred(address(0), msgSender);
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
    uint256[49] private __gap;
}











/**
 * @dev Required interface of an ERC1155 compliant contract, as defined in the
 * https://eips.ethereum.org/EIPS/eip-1155[EIP].
 *
 * _Available since v3.1._
 */
interface IERC1155Upgradeable is IERC165Upgradeable {
    /**
     * @dev Emitted when `value` tokens of token type `id` are transferred from `from` to `to` by `operator`.
     */
    event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value);

    /**
     * @dev Equivalent to multiple {TransferSingle} events, where `operator`, `from` and `to` are the same for all
     * transfers.
     */
    event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values);

    /**
     * @dev Emitted when `account` grants or revokes permission to `operator` to transfer their tokens, according to
     * `approved`.
     */
    event ApprovalForAll(address indexed account, address indexed operator, bool approved);

    /**
     * @dev Emitted when the URI for token type `id` changes to `value`, if it is a non-programmatic URI.
     *
     * If an {URI} event was emitted for `id`, the standard
     * https://eips.ethereum.org/EIPS/eip-1155#metadata-extensions[guarantees] that `value` will equal the value
     * returned by {IERC1155MetadataURI-uri}.
     */
    event URI(string value, uint256 indexed id);

    /**
     * @dev Returns the amount of tokens of token type `id` owned by `account`.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     */
    function balanceOf(address account, uint256 id) external view returns (uint256);

    /**
     * @dev xref:ROOT:erc1155.adoc#batch-operations[Batched] version of {balanceOf}.
     *
     * Requirements:
     *
     * - `accounts` and `ids` must have the same length.
     */
    function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids) external view returns (uint256[] memory);

    /**
     * @dev Grants or revokes permission to `operator` to transfer the caller's tokens, according to `approved`,
     *
     * Emits an {ApprovalForAll} event.
     *
     * Requirements:
     *
     * - `operator` cannot be the caller.
     */
    function setApprovalForAll(address operator, bool approved) external;

    /**
     * @dev Returns true if `operator` is approved to transfer ``account``'s tokens.
     *
     * See {setApprovalForAll}.
     */
    function isApprovedForAll(address account, address operator) external view returns (bool);

    /**
     * @dev Transfers `amount` tokens of token type `id` from `from` to `to`.
     *
     * Emits a {TransferSingle} event.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - If the caller is not `from`, it must be have been approved to spend ``from``'s tokens via {setApprovalForAll}.
     * - `from` must have a balance of tokens of type `id` of at least `amount`.
     * - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155Received} and return the
     * acceptance magic value.
     */
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data) external;

    /**
     * @dev xref:ROOT:erc1155.adoc#batch-operations[Batched] version of {safeTransferFrom}.
     *
     * Emits a {TransferBatch} event.
     *
     * Requirements:
     *
     * - `ids` and `amounts` must have the same length.
     * - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155BatchReceived} and return the
     * acceptance magic value.
     */
    function safeBatchTransferFrom(address from, address to, uint256[] calldata ids, uint256[] calldata amounts, bytes calldata data) external;
}


interface INftFractionsRepository is IERC1155Upgradeable {
    /**
     * @dev when someone transfers his tokens to the other chain the bridge contract will call this burn function
     * The bridge contract is the owner of NftFractionsRepository.
     *
     * Requirements:
     * - only the owner (the bridge contract) can call
     * - the contract is not paused
     */
    function burn(
        uint256 tokenId,
        uint256 amount,
        address transferer
    ) external;

    /**
     * @dev when someone transfers his tokens from the other chain to this chain the bridge contract will call this mint function
     *
     * Requirements:
     * - only the owner (the bridge contract) can call
     * - the contract is not paused
     */
    function mint(
        address erc721ContractAddress,
        uint256 erc721TokenId,
        uint256 erc1155TokenId,
        uint256 erc1155Amount,
        uint256 totalFractionsAmount,
        address transferer,
        string memory tokenURI
    ) external;

    /**
     * @dev same as safeTransferFrom in ERC1155 with one restriction:
     * - the contract is not paused
     */
    function transferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external;

    /**
     * @dev returns amount of fractions minted for a token
     */
    function getTotalFractionsAmount(uint256 _tokenId)
        external
        returns (uint256);

    /**
     * @dev returns original ERC721 contract address for a token
     */
    function getErc721ContractAddress(uint256 _tokenId)
        external
        returns (address);
}


contract DexBase is Initializable, PausableUpgradeable, OwnableUpgradeable {
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
        onlyOwner()
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
    function withdrawEth(uint256 amount) public {
        require(!paused(), "Not allowed while paused");
        require(
            ethBalance[msg.sender] - ethReservedBalance[msg.sender] >= amount,
            "ETH balance is not enough"
        );
        ethBalance[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);

        _onEthBalanceChange(msg.sender, ethBalance[msg.sender]);
    }

    function pause() public onlyOwner() {
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
            for (uint256 j = i; j < orders.length - 1; j++) {
                orders[j] = orders[j + 1];
            }
            _onOrderRemoval(orders[orders.length - 1].id);
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


contract MaticDex is DexBase {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    event OrderUpsert(
        uint256 orderId,
        address trader,
        Side side,
        uint256 tokenId,
        uint256 amount,
        uint256 filled,
        uint256 price,
        uint256 timestamp
    );

    event OrderRemoval(uint256 orderId);

    event NewTrade(
        uint256 tradeId,
        uint256 orderId,
        uint256 tokenId,
        address trader1,
        address trader2,
        uint256 amount,
        uint256 price,
        uint256 date
    );

    event EthBalanceChange(address account, uint256 balance);

    event EthReservedBalanceChange(address account, uint256 balance);

    event SharesReservedBalanceChange(
        address account,
        uint256 tokenId,
        uint256 sharesReservedBalance
    );

    CountersUpgradeable.Counter private _ids;

    function initialize() public initializer {
        __DexBase_init();
    }

    function _onOrderUpsert(
        uint256 orderId,
        address trader,
        Side side,
        uint256 tokenId,
        uint256 amount,
        uint256 filled,
        uint256 price,
        uint256 timestamp
    ) internal override {
        emit OrderUpsert(
            orderId,
            trader,
            side,
            tokenId,
            amount,
            filled,
            price,
            timestamp
        );
    }

    function _onOrderRemoval(uint256 orderId) internal override {
        emit OrderRemoval(orderId);
    }

    function _onTradeExecution(
        uint256 tradeId,
        uint256 orderId,
        uint256 tokenId,
        address trader1,
        address trader2,
        uint256 matchedAmount,
        uint256 price,
        uint256 timestamp
    ) internal override {
        emit NewTrade(
            tradeId,
            orderId,
            tokenId,
            trader1,
            trader2,
            matchedAmount,
            price,
            timestamp
        );
    }

    function _onEthBalanceChange(address account, uint256 balance)
        internal
        override
    {
        emit EthBalanceChange(account, balance);
    }

    function _onEthReservedBalanceChange(
        address account,
        uint256 reservedBalance
    ) internal override {
        emit EthReservedBalanceChange(account, reservedBalance);
    }

    function _onSharesReservedChange(
        address account,
        uint256 tokenId,
        uint256 sharesReservedBalance
    ) internal override {
        emit SharesReservedBalanceChange(
            account,
            tokenId,
            sharesReservedBalance
        );
    }
}



