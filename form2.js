var http = require('http');
var fs = require('fs');
var qs = require('querystring');
const MongoClient = require('mongodb').MongoClient;
var readline = require('readline');
const url = "mongodb+srv://cate1344:Cad94010@cluster0.tbm9v.mongodb.net/assignment_14?retryWrites=true&w=majority";  // connection string goes here


http.createServer(function(req, res) {
    
    //writing the html form onto the webpage
    if (req.url == "/")
    {
        file = "form.html";
        fs.readFile(file, function(err, text) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(text);
            res.end();
        });
    } 
    
    //webpage where the form is processed and information is written
    else if (req.url == "/process")
    {
        pdata = "";
        req.on('data', data => {
            pdata += data.toString();
        });
        
        req.on('end', () => {
            pdata = qs.parse(pdata);
            query = "";
            if (pdata['choose'] == "Company Name")
            {
                query = {name: pdata['company']};
            }
            else 
            {
                query = {ticker: pdata['stock']};
            }
            
            //function which connects to MongoDB 
             mongoDB(query, function(output) {
            //    console.log("after query");
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(output);
            //    console.log("after output");
                res.end();
            });
        });        
    }
}).listen(8080);

//connects to MongoDB and completes the query search returning the information
//with a callback function
function mongoDB(query, callback)
{
//    console.log("here");

    //connecting to MongoDB
    MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
        if(err) { 
            console.log("Connection err: " + err); return; 
        }
        
        //accessing the database and collection
        var dbo = db.db("assignment_14");
        var coll = dbo.collection('companies');
        
        //console.log("before find");

        
        output = "";
        //searching the collection for documents matching the query
        coll.find(query).toArray(function(err, items) {
            if (err) 
            {
                console.log("Error: " + err);
            }  
            else 
            {
                //creating the formatted output from the found documents
                length = items.length;
                if (length == 0)
                {
                    output += "There is no matching document in the database.";
                }
                else 
                {
                    for (i=0; i<length; i++)
                    {
                        output += "Name: " + items[i].name + " -- Ticker: " + items[i].ticker + "<br>";
                        //console.log(output);
                        //console.log("<br>");
                    }
                }
            }
            //db.close(); --> must close in node.js with ^C
            //console.log("after close");
            callback(output);
        });  
    });
}




