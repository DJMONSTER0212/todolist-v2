//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose')
const _ = require('lodash')
const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const uri = "mongodb+srv://DJ0212:devansh%400212@cluster0.djsnamb.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(uri, () => {
  console.log("DB connected!")
});

const itemSchema = {
  name: String
}
const Item = mongoose.model("Item", itemSchema)

const item1 = new Item({
  name: "Welcome to your todo list!"
})
const item2 = new Item({
  name: "Hit + button to add a new item"
})
const item3 = new Item({
  name: "<--  hit this to delete an item."
})

const defaultItems = [item1, item2, item3];

// Item.insertMany(defaultItems,function(err){
//   if(err){
//     console.log(err)
//   }
//   else {
//     console.log("Mission passed")
//   }
// })
app.get("/", function (req, res) {

  Item.find(function (err, founditems) {
    console.log("Hello");
    if (founditems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err)
        }
        else {
          console.log("Mission passed")
        }
      })
      res.redirect('/')
    }
    if (err) {
      console.log(err)
    }
    else {
      console.log(founditems)
      res.render("list", { listTitle: "Today", newListItems: founditems });
    }

  })

});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  })
  if (listName==="Today"){
    newItem.save();
    res.redirect('/')
  }else {
    List.findOne({name : listName},function(err,foundlist){
      foundlist.items.push(newItem);
      foundlist.save();
      res.redirect("/"+listName)
    })
  }

});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox
  const listName = req.body.listname;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Removed Successfully");
        res.redirect('/')
      }
    })

  }
  else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundlist){
      if(!err){
        res.redirect("/"+listName)
      }
    })
  }
  
});
const listSchema = {
  name: String,
  items: [itemSchema]
}
const List = mongoose.model("List", listSchema)

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/:vari", function (req, res) {
  const customListName = _.capatalize(req.params.vari);
  List.findOne({ name: customListName }, function (err, foundlist) {
    if (!err) {
      if (!foundlist) {
        //create a new list
        // console.log("It doesn't Exist");

        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect('/'+customListName)
      }
      else {
        // show an existing list
        res.render("list",{listTitle:customListName,newListItems:foundlist.items})
      }
    }
  });
})

// app.get("/about", function(req, res){
//   res.render("about");
// });

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
