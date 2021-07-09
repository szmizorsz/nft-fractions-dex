// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155Upgradeable.sol";

interface INftFractionsRepository is IERC1155Upgradeable {
    /**
     * @dev Deposit an ERC721 token and mints an ERC1155 token with the given fractions amount
     * the original ERC721 token is transferred to the address of this smart contract.
     * Before calling this function the user has to call the apporve function on the original NFT contract and
     * approve this smart contract to transfer his NFT.
     *
     * Requirements:
     * - msg.sender has to own the token that is deposited
     * - the contract is not paused
     */
    function depositNft(
        address erc721ContractAddress,
        uint256 erc721TokenId,
        uint256 fractionsAmountToMint
    ) external;

    /**
     * @dev Withdraw an ERC721 token from this contract. The message sender has to own all of the shares in
     * the correspondign ERC1155 token.
     * Successfull withdraw means:
     * - burning the ERC1155 token
     * - transfering the ERC721 token to the owner (msg.sender) = owner of all shares in the ERC1155 token
     *
     * Requirements:
     * - msg.sender has to own all shares in the corresponding ERC1155 token
     * - the contract is not paused
     */
    function withdrawNft(uint256 tokenId) external;

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
     * @dev same as safeTransferFrom in ERC1155 with updating the internal data structures:
     * - updates the ownersByTokenId data structure
     * - updates the tokenIdsByShareOwner data structure
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
