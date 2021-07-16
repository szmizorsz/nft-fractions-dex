// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./NftFractionsRepositoryBase.sol";

contract BscNftFractionsRepository is
    Initializable,
    ERC1155Upgradeable,
    PausableUpgradeable,
    OwnableUpgradeable,
    NftFractionsRepositoryBase
{
    // custom data structures to keep track of:
    // tokenIds by owner:
    mapping(address => uint256[]) tokenIdsByShareOwner;
    // owners by tokenId:
    mapping(uint256 => address[]) ownersByTokenId;
    // all tokenIds:
    uint256[] tokenIds;

    function initialize(string memory uri_) public initializer {
        __NftFractionsRepositoryBase_init(uri_);
    }

    /**
     * This hook keeps the custom data structures updated after the burn function exectution
     */
    function _afterBurn(
        uint256 tokenId,
        uint256 amount,
        address transferer,
        uint256 transferersAmount
    ) internal override {
        // if the transferer transfers all his amount
        if (transferersAmount == amount) {
            deleteIdFromTokenIdsByShareOwner(transferer, tokenId);
            deleteOwnerFromOwnersByTokenId(transferer, tokenId);
        }
    }

    /**
     * This hook keeps the custom data structures updated after the mint function exectution
     */
    function _afterMint(
        uint256 erc1155TokenId,
        address transferer,
        bool existingToken
    ) internal override {
        // if the token does not exist in this chain yet
        if (!existingToken) {
            tokenIds.push(erc1155TokenId);
        }
        // Has to check if the transferer does not own this tokenId in this chain yet
        uint256 nrOfTokensByTransferer = tokenIdsByShareOwner[transferer]
        .length;
        if (nrOfTokensByTransferer == 0) {
            tokenIdsByShareOwner[transferer].push(erc1155TokenId);
        } else {
            for (uint256 i; i < nrOfTokensByTransferer; i++) {
                if (erc1155TokenId == tokenIdsByShareOwner[transferer][i]) {
                    break;
                }
                if (i == nrOfTokensByTransferer - 1) {
                    tokenIdsByShareOwner[transferer].push(erc1155TokenId);
                }
            }
        }
        // Has to check if the transferer is amoung the owners of this token in this chain
        uint256 nrOfOwnerByTokenId = ownersByTokenId[erc1155TokenId].length;
        if (nrOfOwnerByTokenId == 0) {
            ownersByTokenId[erc1155TokenId].push(transferer);
        } else {
            for (uint256 i; i < nrOfOwnerByTokenId; i++) {
                if (transferer == ownersByTokenId[erc1155TokenId][i]) {
                    break;
                }
                if (i == nrOfOwnerByTokenId - 1) {
                    ownersByTokenId[erc1155TokenId].push(transferer);
                }
            }
        }
    }

    /**
     * This hook keeps the custom data structures updated after the transferFrom function exectution
     */
    function _afterTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        uint256 fromBalanceBefore,
        uint256 toBalanceBefore
    ) internal override {
        if (amount >= fromBalanceBefore) {
            // remove the tokenId from ownersByTokenId[tokenId][from]
            uint256 nrOfOwners = ownersByTokenId[id].length;
            uint256 ownerPosition;
            for (uint256 i; i < nrOfOwners; i++) {
                if (from == ownersByTokenId[id][i]) {
                    ownerPosition = i;
                    break;
                }
            }
            ownersByTokenId[id][ownerPosition] = ownersByTokenId[id][
                nrOfOwners - 1
            ];
            ownersByTokenId[id].pop();
            // delete the tokenId from the tokenIdsByShareOwner array
            deleteIdFromTokenIdsByShareOwner(from, id);
        }
        if (toBalanceBefore == 0) {
            ownersByTokenId[id].push(to);
            tokenIdsByShareOwner[to].push(id);
        }
    }

    /**
     * @dev returns the ERC1155 tokenIds that the shareOwner has shares in
     */
    function getTokenIdsByShareOwner(address shareOwner)
        public
        view
        returns (uint256[] memory)
    {
        return tokenIdsByShareOwner[shareOwner];
    }

    /**
     * @dev returns the owners of a token
     */
    function getOwnersBYtokenId(uint256 tokenId)
        public
        view
        returns (address[] memory)
    {
        return ownersByTokenId[tokenId];
    }

    /**
     * @dev returns all ERC1155 tokenIds managed by this contract
     */
    function getTokenIds() public view returns (uint256[] memory) {
        return tokenIds;
    }

    /**
     * @dev helper to delete a tokenId from tokenIdsByShareOwner
     */
    function deleteIdFromTokenIdsByShareOwner(address owner, uint256 id)
        private
    {
        uint256 nrOfTokensByShareOwner = tokenIdsByShareOwner[owner].length;
        uint256 tokenIdPositionInShareOwner;
        for (uint256 i; i < nrOfTokensByShareOwner; i++) {
            if (id == tokenIdsByShareOwner[owner][i]) {
                tokenIdPositionInShareOwner = i;
                break;
            }
        }
        tokenIdsByShareOwner[owner][
            tokenIdPositionInShareOwner
        ] = tokenIdsByShareOwner[owner][nrOfTokensByShareOwner - 1];
        tokenIdsByShareOwner[owner].pop();
    }

    /**
     * @dev helper to delete an owner from ownersByTokenId
     */
    function deleteOwnerFromOwnersByTokenId(address owner, uint256 id) private {
        uint256 nrOfOwnersByTokenId = ownersByTokenId[id].length;
        uint256 ownerPositionInOwners;
        for (uint256 i; i < nrOfOwnersByTokenId; i++) {
            if (owner == ownersByTokenId[id][i]) {
                ownerPositionInOwners = i;
                break;
            }
        }
        ownersByTokenId[id][ownerPositionInOwners] = ownersByTokenId[id][
            nrOfOwnersByTokenId - 1
        ];
        ownersByTokenId[id].pop();
    }
}
