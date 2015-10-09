# editdata

A desktop app for editing data.

Right now it can only be used as a command-line tool. Running `editdata` will open the editor.

## Work in progress

This is unfinished! Expect a full release along with a new version of [editdata.org](http://editdata.org).

Expect the command-line api to change.

## Install

```
npm install -g editdata/editdata
```

## Usage

Edit a local JSON file:

```
editadata example.json
```

Request a remote JSON file to edit:

```
editdata --url=http://example.com/some.json
```