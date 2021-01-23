# bloglist2020
A web application created during fullstack open 2020


# What I (re-)learned - part 4
### Jest
A good way of developing/debugging tests is to run only one file with ```npm test``` at a time and mark the desired tests with ```.only```. For example:
```
test.only('it is raining', () => {
  expect(inchesOfRain()).toBeGreaterThan(0) // this will be run
})

test('it is not snowing', () => {
  expect(inchesOfSnow()).toBe(0) // this will NOT be run
});
```
When comparing objects, use ```toEqual``` instead of ```toBe```, ```toContainEqual``` instead of ```toContain```, etc. (To check for deep equality and not just that the objects are the same reference)

### Array.prototype.reduce
```reduce``` can be used to find the object with the max value field like this:
```
blogs.reduce((max, blog) => (blog.likes > max.likes ? blog : max), blogs[0]) // blogs[0] is the initial value
```

### async - await
functions marked with ```async``` return ```Promises```. To get the actual value, call the ```async``` function with ```await``` (I had to debug for around 30 minutes because I accidentaly marked a function with ```async``` even though it didn't need to be)

Note: ```await``` can only be used inside functions that have been marked with ```async```

If ```function()``` is ```async```:
```
const returnedValue = function() // returns a Promise
const returnedValue = await function() // returns a value
```
If ```function()``` is NOT ```async```:
```
const returnedValue = function() // returns a value
const returnedValue = await function() // returns a value; even though the await is harmless, it is unnecessary // and misleading
```
### Shallow and deep copying
Shallow copy: creates another reference to the original object, changes to the original affect the copy and vice versa
Deep copy: creates an entirely new object with values copied from the original, changes to the original DO NOT affect the copy and vice versa

See function ```removeId(objects)``` in ```test_helper.js``` for an example of semi-deep copying (i.e. it deep copies object with values (numbers, strings etc.), but if an object has a nested object the nested copy is not deep copied but referenced instead (shallow copied))

### Equality and identity operators (== and ===)
The equality operator ```==``` will attempt to make the data types the same before the comparison, so ```'3' == 3``` will result in ```true```.
The identity operator ```===``` requires both data types to be the same as a prequisite, so ```'3' === 3``` will result in ```false```

Note: do not use these for comparing objects. The equality and identity operators will check only for referential equality. For comparing objects, write your own ```equals```-function or use a ready-made function such as from Lodash.

### Running a group of promises
See ```blog_api_test``` for examples on how to successfully run a group of promises

### VS Code Rest Client
NOTE!!! Be careful with spaces in ```.rest``` files! There must be a single space between the headers and body, and there must be no spaces between the headers and the request definition in the first row of the ```.rest```file.

If there is space between the request definition and the headers, the client will assume that the request has no headers. Based on this I assume that if there is no space or more than one space between the header and body, the client will assume that the body is part of the headers or that there is no body respectively.
