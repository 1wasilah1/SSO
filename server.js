const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');
const appRoutes = require('./routes/appRoutes');


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());  // Untuk parsing body JSON
app.use(express.urlencoded({ extended: true }));  // Untuk parsing data dari form
app.use(cookieParser());

// Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/users', userRoutes);
app.use('/v1/roles', roleRoutes);
// Rute untuk CRUD aplikasi
app.use('/v1/apps', appRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
