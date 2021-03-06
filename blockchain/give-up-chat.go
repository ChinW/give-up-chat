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
	// "reflect"
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
	From string
	To   string
	Msgs  string
	Hash string
}

// type User struct {
//     Name string
// 	Sex string
// }

func main() {
 	// user := &User{Name: "Frank", Sex: "男"}
    // b, err := json.Marshal(user)
    // if err != nil {
    //     fmt.Println(err)
    //     return
    // }
    // fmt.Println(string(b))

	// pfrom := "12323"
	// pto := "2"
	// pmsgs := "3"
	// pHash := "4"
	// promise := &Promise{From: pfrom, To: pto, Msgs: pmsgs, Hash: pHash}
	// obj, err := json.Marshal(promise)
	// if err != nil {
    //     fmt.Println(err)
    //     return
    // }
	// fmt.Println("here", string(obj))

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

	fmt.Printf("Promise: from = %v, to = %v, msgs = %v, hash = %v\n", from, to, msgs, msgHash)
	promise := Promise{From: from, To: to, Msgs: msgs, Hash: msgHash}
	promiseBytes, err := json.Marshal(promise)
	promiseIDBytes, _ := json.Marshal(promiseID)
	
	fmt.Printf("Saved: %v\n", promise)
	fmt.Printf("Saved promiseBytes: %v\n", promiseBytes)
	fmt.Println(promiseBytes)
	fmt.Printf("Saved promiseID: %v\n", promiseID)

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
	fmt.Println("---------------")
	fmt.Println(promise)
	fmt.Println(promise.From)
	fmt.Println(pmBytes)
	return promise, pmBytes, nil
}