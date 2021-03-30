// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract NftFractionsDex is
    Initializable,
    ERC1155Upgradeable,
    PausableUpgradeable,
    OwnableUpgradeable
{
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private _ids;

    struct OriginalToken {
        address originalContract;
        uint256 originalTokenId;
    }

    mapping(uint256 => OriginalToken) originalTokens;
    mapping(uint256 => uint256) fractionsAmountByTokenId;

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
     */
    function depositNft(
        address originalContractAddress,
        uint256 originalTokenId,
        uint256 fractionsAmountToMint
    ) external {
        require(!paused(), "Not allowed while paused");
        IERC721 originalContract = IERC721(originalContractAddress);
        require(
            originalContract.ownerOf(originalTokenId) == msg.sender,
            "msg sender has to own the token to deposit"
        );
        originalContract.transferFrom(
            msg.sender,
            address(this),
            originalTokenId
        );
        _ids.increment();
        uint256 newItemId = _ids.current();
        _mint(msg.sender, newItemId, fractionsAmountToMint, "");
        OriginalToken memory originalToken;
        originalToken.originalContract = originalContractAddress;
        originalToken.originalTokenId = originalTokenId;
        originalTokens[newItemId] = originalToken;
        fractionsAmountByTokenId[newItemId] = fractionsAmountToMint;
    }

    /**
     * @dev returns relevant token data:
     * - original ERC721 contract address
     * - original ERC721 token id
     * - amount of fractions minted
     */
    function getTokenData(uint256 tokenId)
        public
        view
        returns (
            address originalContract,
            uint256 originalTokenId,
            uint256 fractionsAmount
        )
    {
        return (
            originalTokens[tokenId].originalContract,
            originalTokens[tokenId].originalTokenId,
            fractionsAmountByTokenId[tokenId]
        );
    }

    function pause() public onlyOwner() {
        _pause();
    }
}
