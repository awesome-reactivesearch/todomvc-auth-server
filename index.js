const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const Appbase = require('appbase-js');

// middlewares
const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

const checkJwt = jwt({
	// Dynamically provide a signing key
	// based on the kid in the header and
	// the singing keys provided by the JWKS endpoint.
	secret: jwksRsa.expressJwtSecret({
		cache: true,
		rateLimit: true,
		jwksRequestsPerMinute: 5,
		jwksUri: 'https://divyanshu.auth0.com/.well-known/jwks.json',
	}),

	// Validate the audience and the issuer.
	audience: 'https://todomvappbase',
	issuer: 'https://divyanshu.auth0.com/',
	algorithms: ['RS256']
});

const appbaseRef = new Appbase({
	url: "https://scalr.api.appbase.io",
	app: "todomvc-auth",
	credentials: "QiqJNlwfU:41a45e61-f761-44fe-947a-6f47de32ae0a"
});

const ES_TYPE = "todo_reactjs";

// routes
app.post('/', checkJwt, (req, res) => {
    appbaseRef.index({
      type: ES_TYPE,
      id: req.body.id,
      body: {
		id: req.body.id,
		title: req.body.title,
		completed: false,
		createdAt: req.body.createdAt,
		name: req.body.name,
		avatar: req.body.avatar
	  }
    }).on("data", function(response) {
	  res.send({
		  status: 200,
		  message: 'success'
	  });
    }).on("error", function(error) {
	  console.error(error);
	  res.send(error);
    })
})

app.put('/', checkJwt, (req, res) => {
    appbaseRef.update({
      type: ES_TYPE,
      id: req.body.id,
      body: {
		  doc: Object.assign({},
			req.body.completed !== undefined && {
				completed: req.body.completed
			},
			req.body.title && {
				title: req.body.title
			})
	  }
    }).on("data", function(response) {
	  res.send({
		  status: 200,
		  message: 'success'
	  });
    }).on("error", function(error) {
	  console.error(error);
	  res.send(error);
    })
})

app.delete('/', checkJwt, (req, res) => {
	appbaseRef.delete({
		type: ES_TYPE,
		id: req.body.id
	}).on("data", function(response) {
		res.send({
			status: 200,
			message: 'success'
		});
	}).on("error", function(error) {
		console.error(error);
		res.send(error);
	})
})

app.listen(8000, () => {
	console.log('Node middleware listening on port 8000!');
});