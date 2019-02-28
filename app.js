var express          = require("express"),
    methdOverride    = require("method-override"),
    bodyParser       = require("body-parser"),
    mongoose         = require("mongoose"),
    passport         = require('passport'),
    User             = require("./models/user"),
    LocalStrategy    = require('passport-local'),
    passportMongoose = require('passport-local-mongoose'),
    flash            = require("connect-flash"),
    app              = express();
//APP CONFIG
mongoose.connect("mongodb://localhost:27017/news_data", { useNewUrlParser: true });
app.set("view engine" , "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("stylesheet"));
app.use(express.static("images"));
app.use(methdOverride("_method"));
app.use(flash());
//MONGOOSE/MODEL CONFIG
var newsSchema = new mongoose.Schema({
    title:String,
    image:String,
    body:String,
    Tag:String,
    Author:String,
    created: {type: Date , default: Date.now}
});
var news = mongoose.model("news" , newsSchema);
//PASSPORT CONFIG
app.use(require("express-session")({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req,res,next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});
//RESTFUL ROUTES
app.get("/" , function(req , res){
   res.redirect("/news"); 
});
//INDEX ROUTE
app.get("/news" , function(req , res){
    news.find({} , function(err , articles){
        if(err){
            console.log(err);
        }
        else{
            res.render("index" , {articles:articles});
        }
    });
});
//NEW ROUTE
app.get("/news/newpostbyadmin" ,isLoggedIn, function(req , res){
    res.render("new");    
});
//CREATE ROUTE
app.post("/news" ,function(req , res){
    news.create(req.body.newArticle , function(err,newbie){
        if(err){
            console.log(err);
        }
        else{
            req.flash("success" , "New post added successfully");
            res.redirect("/news");
        }
    });
});
//CATEGORIZED LINKS
app.get("/news/selected" , function(req , res){
       news.find({Tag:'selected'} , function(err , selectedNews){
        if(err){
            console.log(err);
        }
        else{
            res.render("selection" , {selectedNews:selectedNews});
        }
    }); 
});
app.get("/news/entertainment" , function(req , res){
       news.find({Tag:'entertainment'} , function(err , entertainment){
        if(err){
            console.log(err);
        }
        else{
            res.render("entertainment" , {entertainment:entertainment});
        }
    }); 
});
app.get("/news/ocassion" , function(req , res){
       news.find({Tag:'ocassion'} , function(err , ocassionNews){
        if(err){
            console.log(err);
        }
        else{
            res.render("ocassion" , {ocassionNews:ocassionNews});
        }
    }); 
});
app.get("/news/sports" , function(req , res){
       news.find({Tag:'sports'} , function(err , sportsNews){
        if(err){
            console.log(err);
        }
        else{
            res.render("sports" , {sportsNews:sportsNews});
        }
    }); 
});
//SHOW ROUTE
app.get("/news/:id" , function(req , res){
   news.findOne({_id:req.params.id}, function(err , foundArticle){
       if(err)
           console.log(err);
       else
           res.render("show" , {foundArticle:foundArticle});
   }); 
});
//EDIT ROUTE
app.get("/news/:id/editbyadmin" ,isLoggedIn,function(req , res){
 news.findOne({_id:req.params.id} , function(err , foundOne){
    if(err){
        res.redirect("/news");
    } 
    else{
        res.render("edit" , {foundOne:foundOne});
    }
 });
});

app.put("/news/:id" ,isLoggedIn, function(req , res){
    news.findOneAndUpdate({_id:req.params.id} , req.body.newArticle , function(err , updatedArticle){
       if(err){
          res.redirect("/news");
       }else{
          req.flash("success" , "Edit successful");
          res.redirect("/news/" + req.params.id);
        }   
    });
});
//app.get("/news/:id/deletebyadmin" ,isLoggedIn, function(req,res){
//  news.findOne({_id:req.params.id} , function(err , deleteOne){
//    if(err){
//        res.redirect("/news");
//    } 
//    else{
//        res.render("delete",{deleteOne:deleteOne});
//    }
// });  
//});
app.delete("/news/:id/deletebyadmin" ,isLoggedIn, function(req , res){
//DESTROY ARTICLE
news.findOneAndDelete({_id:req.params.id} , function(err){
    if(err){
       res.redirect("/news");  
    }else{
        req.flash("success" , "Delete successful");
        res.redirect("/news");
    }
}); 
//REDIRECT SOMEWHERE
    
});
//AUTH ROUTES
//show signup form
app.get("/registerbyadmin" , function(req , res){
   res.render('register'); 
});
//handling user sign up
app.post("/registerbyadmin" , function(req , res){
User.register(new User({username:req.body.username}) , req.body.password ,function(err , user){
    if(err){
        req.flash("error" , err.message);
        return res.render('register');
    }
   passport.authenticate('local')(req , res, function(){
       req.flash("success" , "Welcome to Basirhatkatha.in " +req.user.username);
       res.redirect("/news");
   });
});
});
//LOGIN ROUTES
//render login form
app.get("/login" , function(req , res){
   res.render('login'); 
});
//login logic
//middleware
app.post("/login", passport.authenticate('local',{
    successRedirect:"/news",
    failureRedirect:"/login"
    
}), function(req , res){   
});
app.get("/logout" , function(req , res){
    req.logout();
    req.flash("success","Logged out successfully");
    res.redirect("/news");
});
function isLoggedIn(req , res , next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error" , "Please login to do that");
    res.redirect("/login");
}
var port = process.env.PORT || 1400;
app.listen(port ,process.env.IP, function(){
    console.log("SERVING NEWS APP ON PORT 1400");
});

