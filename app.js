//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {useNewUrlParser: true});
  console.log("Connected");
}

const itemSchema=new mongoose.Schema({
  name:String
});

const Item=mongoose.model("Item",itemSchema);

const item1=new Item({
  name:"Welcome ,Click + to add new Item"
});


const defaultItems=[item1];

const listSchema=new mongoose.Schema({
  name:String,
  items:[itemSchema]
});

const List=mongoose.model("List",listSchema);


app.get("/", function(req, res) {
  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("done");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
     }
  });
});


app.get("/:customListName",function(req,res){
  const customListName=req.params.customListName;

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list=new List({
          name:customListName,
          items:defaultItems
        });
      list.save();
      res.redirect("/"+customListName);
      }else{
        res.render("list",{listTitle:foundList.name, newListItems: foundList.items});
      }
    }
  });

    });


app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const item =new Item({
    name:itemName
  });
  item.save();
  res.redirect("/");
});

app.post("/delete",function(req,res){
   const checkedItemId=req.body.checkbox;
   Item.findByIdAndDelete(checkedItemId,function(err){
     if(!err){
       console.log("Success");
        res.redirect("/");
     }
   });
});





app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
