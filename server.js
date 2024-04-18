const express = require('express');
const path = require('path');
const session = require('express-session');
const mysql = require("mysql")
const connection = mysql.createConnection({
	host     : 'bbvkapojajjiuiwc8nvs-mysql.services.clever-cloud.com',
	user     : 'bbvkapojajjiuiwc8nvs',
	password : 'dmAxHdAydDkv1gzutxsu',
	database : 'bbvkapojajjiuiwc8nvs'
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Define routes
app.get('/', (req, res) => {
    // Send the index.html file when the root URL is requested
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/auth', function(request, response) {
	// Capture the input fields
	let email = request.body.email;
	let password = request.body.password;
	// Ensure the input fields exists and are not empty
	if (email && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM account WHERE email = ? AND password = ?', [email, password], function(error, results, fields) {
			// If there is an issue with the query, output the error
			// if (error) throw error;
			// // If the account exists

			if (results.length > 0) {
				// Authenticate the user
				request.session.loggedin = true;
				request.session.email = email;
				// Redirect to home page
				response.redirect('/');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.post('/signup', function(request, response) {
    let email = request.body.email;
    let password = request.body.password;
    let firstName = request.body.firstName;
    let lastName = request.body.lastName;
  
    let inputData = {
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
    }
  
    if (email && password) {
      connection.query('SELECT * FROM account WHERE email = ?', [email], function(error, results, fields) {
        if (results.length > 0) {
          response.send('User already exists!');
        } else {
          connection.query('INSERT INTO account SET ?', inputData, function(error, results, fields) {
            if (results.affectedRows > 0) {
              request.session.loggedin = true;
              request.session.email = email;
              response.redirect('/home');
            } else {
              response.send('Sign-up failed!');
            }
            response.end();
          });
        }
      });
    } else {
      response.send('Please enter Username and Password!');
      response.end();
    }
  });

app.get('/home', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		// Output username
		response.send('Welcome back, ' + request.session.email + '!');
	} else {
		// Not logged in
		response.send('Please login to view this page!');
	}
	response.end();
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
