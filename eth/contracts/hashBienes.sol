// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
// pragma solidity >=0.4.21 <0.7.0;

contract hashBienes {
    
    bytes32 valor_hash;
    string placa;
    string descripcion;
    string espacio_fisico;
    string sede;
    string marca_serie;
    string estado;
    string responsable;
    string id_responsable;

    function generateHashVal(
        
        string memory _placa,
        string memory _descripcion,
        string memory _espacio_fisico,
        string memory _sede,
        string memory _marca_serie,
        string memory _estado,
        string memory _responsable,
        string memory _id_responsable
    ) 
    
    public returns (bytes32) {
        placa = _placa;
        descripcion = _descripcion;
        espacio_fisico = _espacio_fisico;
        sede = _sede;
        marca_serie = _marca_serie;
        estado = _estado;
        responsable = _responsable;
        id_responsable = _id_responsable;
        valor_hash = keccak256(
            abi.encodePacked(
                placa,
                descripcion,
                espacio_fisico,
                sede,
                marca_serie,
                estado,
                responsable,
                id_responsable
            )
        );
    }

    function getHash() public view returns (bytes32) {
        {
            return valor_hash;
        }
    }
}
