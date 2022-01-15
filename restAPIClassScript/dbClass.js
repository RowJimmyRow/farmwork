const {Datastore} = require('@google-cloud/datastore');
const projectID = 'cs493-portfolio-teetejoh';

const datastore = new Datastore({projectId:projectID});

function fromDatastore(item){
    item.id = item[Datastore.KEY].id;
    return item;
}

class dbClass {
    constructor(kind){
        this.kind = kind;
    };

    //  Add new values to the Datastore
    async postValue(data){
        const key = datastore.key(this.kind);
        await datastore.save({"key":key, "data":data})
        return key
    }

    // Get all items of a KIND with a specific parameter passed
    async getAllParam(paramName, param){
        const q = datastore.createQuery(this.kind).filter(paramName, '=', param);
        const entities = await datastore.runQuery(q)
        return entities[0].map(fromDatastore);
    }
        
    // Get all items of a KIND no pagination
    async getAll(){
        const q = datastore.createQuery(this.kind);
        const entities = await datastore.runQuery(q)
        return entities[0].map(fromDatastore);
    }

    // Get all items of a KIND with pagination
    async getAllPageParam(req, num, paramName, param){
        let q = datastore.createQuery(this.kind).limit(num).filter(paramName, '=', param);

        if(Object.keys(req.query).includes("cursor")) {
            q = q.start(req.query.cursor);
        } 
        const results = {};
        const entities = await datastore.runQuery(q)
        results.items = entities[0].map(fromDatastore);

        if(entities[1].moreResults !== Datastore.NO_MORE_RESULTS) {
            results.next = `${req.protocol}://${req.get("host")}${req.baseUrl}?cursor=${entities[1].endCursor}`
        }
        return results
    }
    // Get all items of a KIND with pagination
    async getAllPage(req, num){
        let q = datastore.createQuery(this.kind).limit(num);

        if(Object.keys(req.query).includes("cursor")) {
            q = q.start(req.query.cursor);
        } 
        const results = {};
        const entities = await datastore.runQuery(q)
        results.items = entities[0].map(fromDatastore);

        if(entities[1].moreResults !== Datastore.NO_MORE_RESULTS) {
            results.next = `${req.protocol}://${req.get("host")}${req.baseUrl}?cursor=${entities[1].endCursor}`
        }

        return results
    }

    // Get a single item of a KIND
    async getSingle(id){
        let intID = -1;
        if(!isNaN(parseInt(id,10))) {
            intID = parseInt(id, 10);
        }
        const key = datastore.key([this.kind, intID]);
        const q = datastore.createQuery(this.kind).filter("__key__", '=', key);
        const entity = await datastore.runQuery(q)
        return entity[0].map(fromDatastore)[0];
    }

        // Get a single item of a KIND with param
        async getSingleParam(paramName, param){
            const q = datastore.createQuery(this.kind).filter(paramName, '=', param);
            const entity = await datastore.runQuery(q);      
            return entity[0].map(fromDatastore)[0];
        }

    // Confirm if an id is in the Datastore of given KIND
    async isValidID(id) {
        let intID = -1;
        if(!isNaN(parseInt(id,10))) {
            intID = parseInt(id, 10);
        }
        const key = datastore.key([this.kind, intID]);
        const q = datastore.createQuery(this.kind).filter("__key__", '=', key);
        const entity = await datastore.runQuery(q)
        if (entity[0].length === 0) {
            return false
        } else {
            return true
        }
    }

    // Function to add or subtract a value from a User's count parameter
    async changeUserCount(paramName, param, changeVal) {
        const q = datastore.createQuery(this.kind).filter(paramName, '=', param);
        const entity = await datastore.runQuery(q);  
        const key = entity[0][0][Datastore.KEY];
        entity[0][0].count += changeVal;
        await datastore.save({"key":key, "data":entity[0][0]});
    }

    async isUniqueParam(paramName, param) {
        const q = datastore.createQuery(this.kind).filter(paramName, '=', param);
        const entity = await datastore.runQuery(q);
        if (entity[0].length === 0) {
            return true;
        } else {
            return false;
        }
    }



    // Patch(really PUT) an item's value
    async patchValue(id, data){;
        const key = datastore.key([this.kind, parseInt(id,10)]);
        return await datastore.save({"key":key, "data":data});
    }
    
    // PUT an item's value
    async putValue(id, data){
        const key = datastore.key([this.kind, parseInt(id,10)]);
        return await datastore.save({"key":key, "data":data});
    }
    // Delete an item from the Datastore with given ID
    async deleteValue(id){
    const key = datastore.key([this.kind, parseInt(id,10)]);
    return await datastore.delete(key);
    }
};

module.exports = dbClass;