import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
	let token = req.cookies.accessToken;

	!token
		? res.status(404).send({
				message: "No Authentication Cookies Found!",
		  })
		: jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
				if (err) {
					res.clearCookie("accessToken");
					res.status(400).send({
						message: err.name,
					});
				} else {
					req.userEmail = decoded.email;
					next();
				}
		  });
};

const jwtAuth = {
	verifyToken,
};

export { jwtAuth };
