# Medical Billing System

## Overview

This is a medical billing system built using Node.js, Express.js, and MongoDB. The system allows for the management of medicines, users, and transactions. It includes features such as login, registration, adding/editing medicines, selling medicines, and logging out.

## Features

* User authentication and authorization
* Medicine management (adding, editing, and deleting)
* Transaction management (selling medicines and logging transactions)
* User dashboard and profile management
* Medicine stock management
* Sell medicine page with quantity validation
* Logout feature

## Getting Started

1. Clone this repository to your local machine.
2. Install the required dependencies by running `npm install`.
3. Create a new file named `.env` in the root directory and add the following variables:
    * `SESSION_SECRET`: a secret key for session management
    * `MONGODB_URI`: the URI of your MongoDB database
4. Start the server by running `node app.js`.
5. Open a web browser and navigate to `http://localhost:3000` to access the system.

## Usage

1. Register a new user by clicking on the "Register" link and filling out the registration form.
2. Log in to the system using your username and password.
3. Access the medicine management page by clicking on the "Medicine Stock" link.
4. Add a new medicine by clicking on the "Add Medicine" link and filling out the form.
5. Edit an existing medicine by clicking on the "Edit Medicine" link and updating the form.
6. Sell a medicine by clicking on the "Sell Medicine" link and filling out the form.
7. View your transaction history by clicking on the "Transactions" link.

## Contributing

If you'd like to contribute to this project, please fork this repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License.

## Acknowledgments

This project was built using Node.js, Express.js, and MongoDB. Special thanks to [Express.js](https://expressjs.com/) for providing a robust framework for building web applications.
