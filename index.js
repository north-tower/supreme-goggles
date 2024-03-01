const express = require('express');
const cors = require('cors')


const app = express();

app.use(cors())

app.get("/api/v1/users", (req,res) => {

	const users = [
		{ id: 1, name: "John Doe" },
		{	id: 2, name: "Jane Doe" }
		];
		
		return res.status(200).json({ users });
		});
		
		app.listen(5000, () => {
			console.log("App listening on port 5000!);
			});
