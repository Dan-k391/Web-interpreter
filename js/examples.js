const example_code = {
    '0': `OUTPUT "Hello World!"`,
    '1': `TYPE ListNode
    DECLARE Data: REAL
    DECLARE Ptr: INTEGER
ENDTYPE

DECLARE StartPtr: INTEGER
DECLARE FreePtr: INTEGER

DECLARE List: ARRAY[0:6] OF ListNode

PROCEDURE InitialiseList()
    DECLARE Index: INTEGER
    StartPtr <- -1
    FreePtr <- 0
    FOR Index <- 0 TO 5
        List[Index].Ptr <- Index + 1
    NEXT Index
    List[6].Ptr <- -1
ENDPROCEDURE

PROCEDURE InsertAtHead(DataItem: REAL)
    DECLARE NewNode: INTEGER
    IF FreePtr = -1 THEN
        OUTPUT "Memory is used out"
    ELSE
        NewNode <- FreePtr
        FreePtr <- List[FreePtr].Ptr
        List[NewNode].Data <- DataItem
        List[NewNode].Ptr <- StartPtr
        StartPtr <- NewNode
    ENDIF
ENDPROCEDURE

PROCEDURE PrintList()
    DECLARE CurrentPtr: INTEGER
    CurrentPtr <- StartPtr
    WHILE CurrentPtr <> -1
        OUTPUT List[CurrentPtr].Data
        CurrentPtr <- List[CurrentPtr].Ptr
    ENDWHILE
ENDPROCEDURE

// Call the initial procedure
CALL InitialiseList()

// For for loop to test
DECLARE i: INTEGER

FOR i <- 0 TO 7
    CALL InsertAtHead(RND())
NEXT i

CALL PrintList()
`,
    '2': `DECLARE nums: ARRAY[0:1000] OF REAL
DECLARE i: INTEGER
DECLARE j: INTEGER
DECLARE temp: REAL

FOR i <- 0 TO 1000
    nums[i] <- RND()
    OUTPUT nums[i]
NEXT i

OUTPUT "before"

FOR i <- 1 TO 1000
    FOR j <- 0 TO 1000 - i
        IF nums[j] > nums[j + 1] THEN
            temp <- nums[j]
            nums[j] <- nums[j + 1]
            nums[j + 1] <- temp
        ENDIF
    NEXT j
NEXT i

FOR i <- 0 TO 1000
    OUTPUT nums[i]
NEXT i    
`,
}

export {
    example_code
}
