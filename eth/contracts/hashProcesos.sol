// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
// pragma solidity >=0.4.21 <0.7.0;

contract hashProcesos{
    
    bytes32 valor_hash;
    string id_procedimiento;
    string fecha;
    string descripcion;
    string procedimiento;
    string id_responsable;
    string responsable;
    string placa;
    string hash_ipfs;

    function generateHashVal(
        
        string memory _id_procedimiento, 
        string memory _fecha,
        string memory _descripcion,
        string memory _procedimiento,
        string memory _id_responsable,
        string memory _responsable,
        string memory _placa,
        string memory _hash_ipfs
        ) public returns (bytes32) {
            id_procedimiento = _id_procedimiento;
            fecha = _fecha;
            descripcion = _descripcion;
            procedimiento = _procedimiento;
            id_responsable = _id_responsable;
            responsable = _responsable;
            placa = _placa;
            hash_ipfs = _hash_ipfs;
            valor_hash = keccak256(
                abi.encodePacked(
                    id_procedimiento,
                    fecha,
                    descripcion,
                    procedimiento,
                    id_responsable,
                    responsable,
                    placa,
                    hash_ipfs
                )
            );
        }

    function getHash() public view returns (bytes32) {
        {
            return valor_hash;
        }
    }
}
