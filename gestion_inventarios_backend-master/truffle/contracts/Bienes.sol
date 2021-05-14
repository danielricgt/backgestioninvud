pragma solidity >=0.4.21 <0.7.0;

contract Bienes {
    bytes32 valor_hash;
    string uid;
    string description;
    string idplate;
    string place;
    string fk_inventory;
    string physical_space;
    string brand_and_serie;
    string state;

    constructor(
        string memory uid,
        string memory description,
        string memory idplate,
        string memory place,
        string memory fk_inventory,
        string memory physical_space,
        string memory brand_and_serie,
        string memory state
    ) public {}

    function generateHashVal(
        string memory uid,
        string memory description,
        string memory idplate,
        string memory place,
        string memory fk_inventory,
        string memory physical_space,
        string memory brand_and_serie,
        string memory state
    ) public returns (bytes32) {
        valor_hash = keccak256(
            abi.encodePacked(
                uid,
                description,
                idplate,
                place,
                fk_inventory,
                physical_space,
                brand_and_serie,
                state
            )
        );
    }

    function getHash() public view returns (bytes32) {
        {
            return valor_hash;
        }
    }
}
