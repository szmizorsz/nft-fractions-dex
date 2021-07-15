// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "./NftFractionsRepositoryBase.sol";

contract MaticNftFractionsRepository is NftFractionsRepositoryBase {
    using CountersUpgradeable for CountersUpgradeable.Counter;

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

    function initialize(string memory uri_) public initializer {
        __NftFractionsRepositoryBase_init(uri_);
    }

    /**
     * @dev Deposit an ERC721 token and mints an ERC1155 token with the given fractions amount
     * the original ERC721 token is transferred to the address of this smart contract.
     * Before calling this function the user has to call the apporve function on the original NFT contract and
     * approve this smart contract to transfer his NFT.
     * It emits DepositNft event.
     *
     * Requirements:
     * - msg.sender has to own the token that is deposited
     * - the contract is not paused
     */
    function depositNft(
        address erc721ContractAddress,
        uint256 erc721TokenId,
        uint256 fractionsAmountToMint
    ) external {
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
     * It emits WithdraeNft event.
     *
     * Requirements:
     * - msg.sender has to own all shares in the corresponding ERC1155 token
     * - the contract is not paused
     */
    function withdrawNft(uint256 tokenId) external {
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
}
