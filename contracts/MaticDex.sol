// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "./DexBase.sol";

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
