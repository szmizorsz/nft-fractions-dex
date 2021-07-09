// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./INftFractionsRepository.sol";

contract MaticNftFractionsRepository is
    Initializable,
    ERC1155Upgradeable,
    PausableUpgradeable,
    OwnableUpgradeable,
    INftFractionsRepository
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    struct Token {
        address erc721ContractAddress;
        uint256 erc721TokenId;
        uint256 totalFractionsAmount;
        string tokenURI;
    }

    event DepositNft(
        uint256 erc1155TokenId,
        address erc721ContractAddress,
        uint256 erc721TokenId,
        uint256 totalFractionsAmount,
        string tokenURI
    );

    event WithdrawNft(
        uint256 erc1155TokenId,
        address erc721ContractAddress,
        uint256 erc721TokenId
    );

    CountersUpgradeable.Counter private _ids;
    mapping(uint256 => Token) tokens;

    function initialize(string memory uri_) public initializer {
        __Context_init_unchained();
        __ERC165_init_unchained();
        __Pausable_init_unchained();
        __ERC1155_init_unchained(uri_);
        __Ownable_init_unchained();
    }

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
    ) external override {
        require(!paused(), "Not allowed while paused");
        ERC721URIStorage erc721Contract = ERC721URIStorage(
            erc721ContractAddress
        );
        require(
            erc721Contract.ownerOf(erc721TokenId) == msg.sender,
            "msg sender has to own the token to deposit"
        );
        erc721Contract.transferFrom(msg.sender, address(this), erc721TokenId);
        _ids.increment();
        uint256 newItemId = _ids.current();
        _mint(msg.sender, newItemId, fractionsAmountToMint, "");
        string memory tokenURI;
        tokenURI = erc721Contract.tokenURI(erc721TokenId);
        Token memory token;
        token.erc721ContractAddress = erc721ContractAddress;
        token.erc721TokenId = erc721TokenId;
        token.totalFractionsAmount = fractionsAmountToMint;
        token.tokenURI = tokenURI;
        tokens[newItemId] = token;

        emit DepositNft(
            newItemId,
            erc721ContractAddress,
            erc721TokenId,
            fractionsAmountToMint,
            tokenURI
        );
    }

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
    function withdrawNft(uint256 tokenId) external override {
        require(!paused(), "Not allowed while paused");
        uint256 totalFractionsAmount = tokens[tokenId].totalFractionsAmount;
        uint256 sendersAmount = balanceOf(msg.sender, tokenId);
        require(
            totalFractionsAmount == sendersAmount,
            "message sender has to own all of the shares"
        );
        //sends the original token in the ERC721 contract
        address erc721ContractAddress = tokens[tokenId].erc721ContractAddress;
        uint256 erc721TokenId = tokens[tokenId].erc721TokenId;
        IERC721 erc721Contract = IERC721(erc721ContractAddress);
        erc721Contract.transferFrom(address(this), msg.sender, erc721TokenId);
        //burns the ERC1155 token
        _burn(msg.sender, tokenId, totalFractionsAmount);
        //deletes the token struct
        delete tokens[tokenId];

        emit WithdrawNft(tokenId, erc721ContractAddress, erc721TokenId);
    }

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
    ) external override onlyOwner() {
        require(!paused(), "Not allowed while paused");
        uint256 transferersAmount = balanceOf(transferer, tokenId);
        require(
            transferersAmount >= amount,
            "transferer has to own equal or more shares than the given amount"
        );
        //burns the shares from ERC1155 token
        _burn(transferer, tokenId, amount);
    }

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
    ) external override onlyOwner() {
        require(!paused(), "Not allowed while paused");
        _mint(transferer, erc1155TokenId, erc1155Amount, "");
        // if the token does not exist in this chain yet
        if (tokens[erc1155TokenId].erc721ContractAddress == address(0)) {
            Token memory token;
            token.erc721ContractAddress = erc721ContractAddress;
            token.erc721TokenId = erc721TokenId;
            token.totalFractionsAmount = totalFractionsAmount;
            token.tokenURI = tokenURI;
            tokens[erc1155TokenId] = token;
        }
    }

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
    ) external override {
        require(!paused(), "Not allowed while paused");
        safeTransferFrom(from, to, id, amount, data);
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
}
