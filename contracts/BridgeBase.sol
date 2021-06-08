// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./NftFractionsRepository.sol";

contract BridgeBase is Ownable, Pausable {
    uint256 public nonce;
    mapping(uint256 => bool) public processedNonces;
    NftFractionsRepository nftFractionsRepository;

    enum Step {Burn, Mint}

    event Transfer(
        address from,
        address to,
        uint256 erc1155TokenId,
        uint256 erc1155Amount,
        address erc721ContractAddress,
        uint256 erc721TokenId,
        uint256 date,
        uint256 nonce,
        Step indexed step
    );

    function setNftFractionsRepository(address nftFractionsRepositoryAddress)
        public
        onlyOwner()
    {
        nftFractionsRepository = NftFractionsRepository(
            nftFractionsRepositoryAddress
        );
    }

    /**
     * @dev someone transfers can transfer his tokens to the other chain by calling this function.
     * It will burn the amount in this chain by calling the nftFractionsRepository and emits an event so the bridge API can
     * listen to that event and call the mint function of the bridge on the other chain.
     *
     * Requirements:
     * - balance has to be higher then the amount to transfer
     * - the contract is not paused
     */
    function burn(
        address to,
        uint256 erc1155TokenId,
        uint256 erc1155Amount,
        address erc721ContractAddress,
        uint256 erc721TokenId
    ) external {
        require(!paused(), "Not allowed while paused");
        uint256 transfererBalance =
            nftFractionsRepository.balanceOf(msg.sender, erc1155TokenId);
        require(
            transfererBalance >= erc1155Amount,
            "message sender's token balance is too low"
        );
        nftFractionsRepository.burn(erc1155TokenId, erc1155Amount, msg.sender);
        emit Transfer(
            msg.sender,
            to,
            erc1155TokenId,
            erc1155Amount,
            erc721ContractAddress,
            erc721TokenId,
            block.timestamp,
            nonce,
            Step.Burn
        );
        nonce++;
    }

    /**
     * @dev when someone initiated a transfer on the other chain and the bridge API detects that by catching the Transfer event
     * then the bridge API will call this mint function.
     * The bridge API is the owner of the bridge contract.
     *
     * Requirements:
     * - balance has to be higher then the amount to transfer
     * - the contract is not paused
     */
    function mint(
        address from,
        address to,
        address erc721ContractAddress,
        uint256 erc721TokenId,
        uint256 erc1155TokenId,
        uint256 erc1155Amount,
        uint256 otherChainNonce
    ) external onlyOwner() {
        require(!paused(), "Not allowed while paused");
        require(
            processedNonces[otherChainNonce] == false,
            "transfer already processed"
        );
        processedNonces[otherChainNonce] = true;
        nftFractionsRepository.mint(
            erc721ContractAddress,
            erc721TokenId,
            erc1155TokenId,
            erc1155Amount,
            to
        );
        emit Transfer(
            from,
            to,
            erc1155TokenId,
            erc1155Amount,
            erc721ContractAddress,
            erc721TokenId,
            block.timestamp,
            otherChainNonce,
            Step.Mint
        );
    }

    function pause() public onlyOwner() {
        _pause();
    }
}
