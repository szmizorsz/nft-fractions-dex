// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./DexBase.sol";

contract BscDex is DexBase {
    function initialize() public initializer {
        __DexBase_init();
    }

    /**
     * @dev returns the orders of the token and side
     */
    function getOrders(uint256 tokenId, Side side)
        external
        view
        returns (Order[] memory)
    {
        return orderBook[tokenId][uint256(side)];
    }

    /**
     * @dev returns the ETH balance of the owner
     */
    function getEthBalance(address owner) public view returns (uint256) {
        return ethBalance[owner];
    }

    /**
     * @dev returns the ETH reserved balance of the owner
     */
    function getEthReserveBalance(address owner) public view returns (uint256) {
        return ethReservedBalance[owner];
    }

    /**
     * @dev returns the shares reserved in orders for a given owner and tokenId
     */
    function getSharesReserveBalance(address owner, uint256 tokenId)
        public
        view
        returns (uint256)
    {
        return sharesReserved[owner][tokenId];
    }
}
