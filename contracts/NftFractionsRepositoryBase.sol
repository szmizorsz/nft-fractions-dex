// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./INftFractionsRepository.sol";

contract NftFractionsRepositoryBase is
    Initializable,
    ERC1155Upgradeable,
    PausableUpgradeable,
    OwnableUpgradeable,
    INftFractionsRepository
{
    struct Token {
        address erc721ContractAddress;
        uint256 erc721TokenId;
        uint256 totalFractionsAmount;
        string tokenURI;
    }

    mapping(uint256 => Token) internal tokens;

    function __NftFractionsRepositoryBase_init(string memory uri_)
        internal
        initializer
    {
        __Context_init_unchained();
        __ERC165_init_unchained();
        __Pausable_init_unchained();
        __ERC1155_init_unchained(uri_);
        __Ownable_init_unchained();
    }

    /**
     * @dev when someone transfers his tokens to the other chain the bridge contract will call this burn function
     * The bridge contract is the owner of NftFractionsRepository.
     *
     * Requirements:
     * - only the owner (the bridge contract = owner) can call
     * - the contract is not paused
     *
     * There is a hook (_afterBurn) that can be overriden to implement some custom logic performed after the burn
     */
    function burn(
        uint256 tokenId,
        uint256 amount,
        address transferer
    ) external override onlyOwner() {
        require(!paused(), "Not allowed while paused");
        uint256 transferersAmount = balanceOf(transferer, tokenId);
        require(
            transferersAmount >= amount,
            "transferer has to own equal or more shares than the given amount"
        );
        //burns the shares from ERC1155 token
        _burn(transferer, tokenId, amount);

        _afterBurn(tokenId, amount, transferer, transferersAmount);
    }

    /**
     * @dev when someone transfers his tokens from the other chain to this chain the bridge contract will call this mint function
     *
     * Requirements:
     * - only the owner (the bridge contract = owner) can call
     * - the contract is not paused
     *
     * There is a hook (_afterMint) that can be overriden to implement some custom logic performed after the mint
     */
    function mint(
        address erc721ContractAddress,
        uint256 erc721TokenId,
        uint256 erc1155TokenId,
        uint256 erc1155Amount,
        uint256 totalFractionsAmount,
        address transferer,
        string memory tokenURI
    ) external override onlyOwner() {
        require(!paused(), "Not allowed while paused");
        _mint(transferer, erc1155TokenId, erc1155Amount, "");
        // if the token does not exist in this chain yet
        bool existingToken = true;
        if (tokens[erc1155TokenId].erc721ContractAddress == address(0)) {
            Token memory token;
            token.erc721ContractAddress = erc721ContractAddress;
            token.erc721TokenId = erc721TokenId;
            token.totalFractionsAmount = totalFractionsAmount;
            token.tokenURI = tokenURI;
            tokens[erc1155TokenId] = token;
            existingToken = false;
        }

        _afterMint(erc1155TokenId, transferer, existingToken);
    }

    /**
     * @dev same as safeTransferFrom with one restriction:
     * - the contract is not paused
     *
     * There is a hook (_afterTransfer) that can be overriden to implement some custom logic performed after the transferFrom
     */
    function transferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external override {
        require(!paused(), "Not allowed while paused");
        uint256 fromBalanceBefore = balanceOf(from, id);
        uint256 toBalanceBefore = balanceOf(to, id);
        safeTransferFrom(from, to, id, amount, data);

        _afterTransferFrom(
            from,
            to,
            id,
            amount,
            fromBalanceBefore,
            toBalanceBefore
        );
    }

    /**
     * @dev returns relevant token data:
     * - original ERC721 contract address
     * - original ERC721 token id
     * - amount of fractions minted
     */
    function getTokenData(uint256 _tokenId)
        public
        view
        returns (
            address erc721ContractAddress,
            uint256 erc721TokenId,
            uint256 totalFractionsAmount,
            string memory tokenURI
        )
    {
        return (
            tokens[_tokenId].erc721ContractAddress,
            tokens[_tokenId].erc721TokenId,
            tokens[_tokenId].totalFractionsAmount,
            tokens[_tokenId].tokenURI
        );
    }

    /**
     * @dev returns amount of fractions minted for a token
     */
    function getTotalFractionsAmount(uint256 _tokenId)
        external
        view
        override
        returns (uint256)
    {
        return (tokens[_tokenId].totalFractionsAmount);
    }

    /**
     * @dev returns original ERC721 contract address for a token
     */
    function getErc721ContractAddress(uint256 _tokenId)
        external
        view
        override
        returns (address)
    {
        return (tokens[_tokenId].erc721ContractAddress);
    }

    function pause() public onlyOwner() {
        _pause();
    }

    /**
     * @dev hook function that is called at the end of the burn function
     */
    function _afterBurn(
        uint256 tokenId,
        uint256 amount,
        address transferer,
        uint256 transferersAmount
    ) internal virtual {}

    /**
     * @dev hook function that is called at the end of the mint function
     */
    function _afterMint(
        uint256 erc1155TokenId,
        address transferer,
        bool existingToken
    ) internal virtual {}

    /**
     * @dev hook function that is called at the end of the transferFrom function
     */
    function _afterTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        uint256 fromBalanceBefore,
        uint256 toBalanceBefore
    ) internal virtual {}
}
