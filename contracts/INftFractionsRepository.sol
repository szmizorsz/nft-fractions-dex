// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155Upgradeable.sol";

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
