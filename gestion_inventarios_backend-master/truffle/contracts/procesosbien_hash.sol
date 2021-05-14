pragma solidity >=0.4.21 <0.7.0;




contract GenerateHashprocesos{
    
    bytes32 valor_hash;
    string uid;
    string start_date;
    string end_date;
    string description;
    string reason;
    string hash;
    string fk_person;
    string fk_good;
    string hash_ipfs;

    
    constructor (
        string  memory uid, 
        string memory  start_date,
        string memory  end_date,
        string memory  description,
        string memory  reason,
        string memory  hash,
        string memory  fk_person,
        string memory  fk_good,
        string memory  hash_ipfs) 
        
        public {}
        
     
    
    function generateHashVal(string uid, string start_date, string end_date, string description, string reason, string hash, string fk_person, string fk_good, string hash_ipfs)  public returns (bytes32){
       
        valor_hash= keccak256(uid, start_date, end_date, description, reason, hash, fk_person, fk_good, hash_ipfs);
    }
    
 function getHash()view returns (bytes32){{
     
     return valor_hash;
 }
     
 }

 

}