# VibeSpace Backend

Welcome to the backend repository for **VibeSpace**, a social media platform with private note-taking capabilities. Built using the MERN stack, this backend provides robust APIs for user management, post handling, social interactions, and secure authentication.

## Features

- **User Authentication**:
  - Email and password-based signup/login with JWT authentication.
  - Email verification using OTPs via Nodemailer.

- **Post Management**:
  - Create, edit, delete, and retrieve posts.
  - Upload images to posts using Cloudinary.
  - Like and comment on posts.

- **Social Interactions**:
  - Follow/unfollow other users.
  - View followers and following lists.

- **Private Space**:
  - Create, update, and delete private notes that are accessible only to the user.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/vibespace-backend.git
   ```

2. Navigate to the backend folder:
   ```bash
   cd vibespace-backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory and configure the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   EMAIL_USER=your_email_address
   EMAIL_PASSWORD=your_email_password
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Folder Structure

```plaintext
vibespace-backend/
├── controllers/
│   ├── user.controller.js       # Handles user authentication
│   └── post.controller.js       # Handles post CRUD and interactions
│   └── note.controller.js       # Handles private note functionalities
├── models/
│   ├── User.js                 # User schema
│   └── Post.js                 # Post schema
│   └── Note.js                 # Note schema
├── middlewares/
│   ├── auth.middleware.js      # Verifies JWT tokens
│   └── multer.middleware.js     # Handles file uploads
├── services/
│   ├── cloudinary.js           # Cloudinary service setup
├── utils/
│   ├── ApiResponse.js         # Standardized API responses
│   ├── ApiError.js            # Standardized API error
│   └── asyncHandler.js        # Async error handling wrapper
├── routes/
│   ├── user.routes.js         # Authentication routes
│   └── post.routes.js         # Post routes
├── .env.example                   # Example environment variables
├── server.js                      # Entry point of the application
├── package.json                   # Dependencies and scripts
└── README.md                      # Project documentation
```

## API Endpoints

### Auth Routes
- `POST /api/auth/register` - Register a new user.
- `POST /api/auth/login` - Login a user.
- `POST /api/auth/logout` - Logout the current user.
- `POST /api/auth/verify-email` - Verify email with OTP.

### Post Routes
- `GET /api/posts/` - Get all posts.
- `POST /api/posts/` - Create a new post.
- `PUT /api/posts/:id` - Update a post.
- `DELETE /api/posts/:id` - Delete a post.
- `POST /api/posts/:id/like` - Like or unlike a post.
- `POST /api/posts/:id/comment` - Add a comment to a post.

### Note Routes
- `GET /api/notes/` - Get all private notes.
- `POST /api/notes/` - Create a new note.
- `PUT /api/notes/:id` - Update a note.
- `DELETE /api/notes/:id` - Delete a note.

## Technologies Used

- **Node.js**: Backend runtime.
- **Express.js**: Web framework.
- **MongoDB**: Database.
- **Mongoose**: Object Data Modeling (ODM).
- **Cloudinary**: Image storage.
- **Nodemailer**: Email services for OTP.
- **JWT**: Secure authentication.
- **Multer**: File uploads.

## Contributing

Contributions are welcome! Please fork this repository and submit a pull request for any feature additions or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgements

Special thanks to the developers and contributors of the open-source libraries and tools used in this project.
