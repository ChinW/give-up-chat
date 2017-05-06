/*
This file is part of give-up-chat
Author: Chi
*/

package main

import (
	// "crypto/md5"
	// "crypto/rand"
	// "encoding/base64"
	// "encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	// "io"
	// "strconv"
	// "time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	// pb "github.com/hyperledger/fabric/protos/peer"
)

type SimpleChaincode struct {
}

// var msgNO int = 0

type Promise struct {
	from string
	to   string
	msgs  string
	hash string
}

func main() {
	// fmt.Println("Hello")
	// from := "1"
	// to := "2"
	// msgs := "3"
	// msgHash := "4"
	// promise := Promise{from: from, to: to, msgs: msgs, hash: msgHash}
	// fmt.Println(promise)
	// obj, _ := json.Marshal(&promise)
	// fmt.Println(obj)
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}

func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	if len(args) != 0 {
		return nil, errors.New("Incorrect number of arguments. Expecting 0")
	}

	fmt.Println("Init [GIVE-UP-CHAT] successful!")

	return nil, nil
}

func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	if function == "promise" {
		if len(args) != 5 {
			return nil, errors.New("Incorrect number of arguments. Expecting 5")
		}
		return t.createPromise(stub, args)
	}
	return nil, errors.New("Unexpected invoke function!")
}

func (t *SimpleChaincode) Query(stub shim.ChaincodeStubInterface, function string, args []string) ([]byte, error) {
	if function == "promiseID" {
		if len(args) != 1 {
			return nil, errors.New("Incorrect number of arguments. Expecting 1")
		}
		_, promiseBytes, err := getPromiseByID(stub, args[0])
		if err != nil {
			fmt.Println("Error get promise by id")
			return nil, err
		}
		return promiseBytes, nil
	}
	return nil, errors.New("Unexpected query method!")
}

// args [from, to, msgs-json-str, msgHash]
func (t *SimpleChaincode) createPromise(stub shim.ChaincodeStubInterface, args []string) ([]byte, error) {
	var from, to, msgs, msgHash, promiseID string
	var err error
	promiseID = args[0]
	from = args[1]
	to = args[2]
	msgs = args[3]
	msgHash = args[4]

	fmt.Printf("Promise: from = %v, to = %v, msgs = %v, hash = %v", from, to, msgs, msgHash)
	promise := Promise{from: from, to: to, msgs: msgs, hash: msgHash}
	promiseBytes, err := json.Marshal(&promise)
	promiseIDBytes, _ := json.Marshal(promiseID)
	
	if err != nil {
		return nil, errors.New("Error create promise")
	}
	err = stub.PutState(promiseID, promiseBytes)
	if err != nil {
		return nil, errors.New("Error in creating promise")
	}
	fmt.Println("Create promise successfully")
	return promiseIDBytes, nil
}

func getPromiseByID(stub shim.ChaincodeStubInterface, promiseID string) (Promise, []byte, error) {
	var promise Promise
	pmBytes, err := stub.GetState(promiseID)
	if err != nil {
		fmt.Println("Error retrieving promise by id")
	}

	err = json.Unmarshal(pmBytes, &promise)
	if err != nil {
		fmt.Println("Error unmarshalling promise by id")
	}
	return promise, pmBytes, nil
}