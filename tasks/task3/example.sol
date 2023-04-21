// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

contract Example {

    uint256 number;
    string str; 
    uint256[] data;

    event Recive(address indexed sender, uint256 indexed value);
    event SetData(uint256 indexed number, string str, uint256[] data);

    receive() external payable {
        emit Recive(msg.sender, msg.value);
    }

    function setData(uint256 _number, string calldata _str, uint256[] calldata _data) public {
        number = _number;
        str = _str;
        for(uint256 i = 0; i < _data.length; i++) {
            data.push(_data[i]);
        }
        emit SetData(_number, _str, _data);
    }
}