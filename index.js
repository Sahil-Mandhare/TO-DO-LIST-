const express = require("express");
const mongoose = require("mongoose");// require mongoose
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const _=require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//create a todolistDB database and connect it
mongoose.connect("mongodb+srv://sahilM2405:sahil2405@cluster0.t7ohnod.mongodb.net/todolistDB", {useNewUrlParser:true, useUnifiedTopology: true});


const db = mongoose.connection;

db.on("error", (error) => {
  console.error("Connection error:", error);
});

db.once("open", () => {
  console.log("Connected to the database!");
});
//create a Schema of only name feild
const itemSchema = new mongoose.Schema({
     name:String
});

const Item = mongoose.model("Item", itemSchema); // create a model of Items

const Item1= new Item({
  name:"Welcome to the todolist"
});

const Item2= new Item({
  name:"Click + button to add items"
});

const Item3= new Item({
  name:"<-- Hit the box to delete>"
});

const defaultItem= [Item1, Item2, Item3 ]; // create a array of items doc

const listSchema={
  name:String,
  items:[itemSchema],
}

const List = mongoose.model("List",listSchema);

      app.get("/", function (req, res) {
        Item.find()
          .then(function (foundItems) {
            if(foundItems.length===0){
              Item.insertMany(defaultItem)
              .then(function () {
                console.log("Successfully saved defult items to DB");
              })
              .catch(function (err) {
                console.log(err);
              });
              res.redirect("/");
            }
            else{
              res.render("list", { listTitle: "Today", newListItems: foundItems });
            }
              
          })
          .catch(function (err) {
            console.log(err);
          });
      });

      app.post("/", function(req, res) {
        const itemName = req.body.newItem;
        const listName = req.body.list;
    
        const item = new Item({
            name: itemName
        });
    
        if (listName === "Today") {
            item.save();
            res.redirect("/");
        } else {
            List.findOne({ name: listName })
                .then(foundList => {
                    foundList.items.push(item); // Corrected property name to 'items'
                    foundList.save();
                    res.redirect("/" + listName);
                })
                .catch(err => console.error(err));
        }
    });

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName =req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId)
    .then(function(item) {
      if (item) {
        console.log("Deleted from database successfully.");
        res.redirect("/");
      } else {
        console.log("Item not found.");
        res.redirect("/");
      }
    })
    .catch(function(err) {
      console.log(err);
    });
  }else{
    List.findOneAndUpdate(
      { name: listName }, // Filter to find the specific list by name
      { $pull: { items: { _id: checkedItemId } } } // Use $pull to remove the item with the given _id from the 'items' array
  )
  .then(foundList => {
      res.redirect("/" + listName); // Redirect after the update is successful
  })
  .catch(err => {
      console.error(err); // Handle any errors that occur during the update process
  });
}
  
});

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  console.log(customListName);

  List.findOne({ name: customListName })
    .then(function(foundList) {
      if (!foundList) {
        const list=new List({
          name:customListName,
          items:defaultItem,
        });
        list.save();
        res.redirect("/"+customListName);
      } else {
        // console.log("Found");

        res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
      }
    })
    .catch(function(err) {
      console.log(err);
    });
  

  
})

app.get("/about", function(req, res){
  res.render("about");
});


const port=3000;
app.listen(port, function() {
  console.log("Server started on port 3000");
});
