const express = require('express');
const router = express.Router();
const db = require('./db');
const multer = require('multer');
const path = require('path');

// For file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Register user
router.post('/registers', upload.single('profile_picture'), (req, res) => {
    const { name, phoneno, address, email, password } = req.body;
    const profilePicture = req.file ? req.file.path : null;

    if (!name || !phoneno || !address || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const checkPhoneQuery = 'SELECT * FROM users WHERE phoneno = ?';
    db.query(checkPhoneQuery, [phoneno], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        if (results.length > 0) {
            return res.status(400).json({ success: false, message: 'Phone number already exists' });
        }

        const query = 'INSERT INTO users (name, phoneno, address, email, password, profile_picture) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [name, phoneno, address, email, password, profilePicture];

        db.query(query, values, (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            res.status(200).json({ success: true, message: 'User registered successfully' });
        });
    });
});

// Login user
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Query to check user credentials
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    const values = [email, password];
    db.query(query, values, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length > 0) {
            const user = results[0];

            // Query to insert into the logins table
            const loginQuery = 'INSERT INTO login (email, password, login_time) VALUES (?, ?, NOW())';
            const loginValues = [email, password];

            db.query(loginQuery, loginValues, (loginErr) => {
                if (loginErr) {
                    return res.status(500).json({ success: false, message: 'Failed to log login event' });
                }

                // Respond with success and user data
                res.status(200).json({ success: true, message: 'Login successful', user });
            });

        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    });
});

//For Upload banner
router.post('/uploadBanner', upload.single('banner'), (req, res) => {
    try {
        if (req.file) {
            const bannerPath = req.file.path;

            // Insert the banner image path into the database
            const sql = 'INSERT INTO upload_banner (banner_img) VALUES (?)';
            db.query(sql, [bannerPath], (err, result) => {
                if (err) {
                    console.error('Database insertion error:', err); // Log the error
                    res.status(500).json({ message: 'Database insertion error', error: err.message });
                    return;
                }
                res.status(200).json({
                    message: 'Banner uploaded and saved to database successfully',
                    filePath: bannerPath,
                });
            });
        } else {
            res.status(400).json({ message: 'No file uploaded' });
        }
    } catch (error) {
        console.error('Error uploading banner:', error);
        res.status(500).json({ message: 'Error uploading banner', error: error.message });
    }
});

//Get Banner
router.get('/all-banners', (req, res) => {
    const query = 'SELECT banner_img FROM upload_banner';

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.status(200).json({ success: true, upload_banner: results });
    });
});

//For Upload Product
router.post('/uploadProduct', upload.single('product_img'), (req, res) => {
    const { product_name, product_detail, product_price } = req.body;
    const product_img = req.file ? req.file.path : null;

    if (!product_name || !product_detail || !product_price) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const query = 'INSERT INTO upload_product (product_name, product_detail, product_price, product_img, date) VALUES (?, ?, ?, ?, NOW() )';

    const values = [product_name, product_detail, product_price, product_img];

    db.query(query, values, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.status(200).json({ success: true, message: 'Product upload successfully' });
    });

});

//Get Upload Product
router.get('/all-product', (req, res) => {
    const query = 'SELECT product_name, product_detail, product_price, product_img FROM upload_product';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.status(200).json({ success: true, upload_product: results });
    });
});

//For Contact us
router.post('/ContactUs', (req, res) => {
    const { name, mobile_no, email, address, description } = req.body;

    if (!name || !mobile_no || !email || !address || !description) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const checkPhoneQuery = 'SELECT * FROM contact_us WHERE mobile_no = ?';
    db.query(checkPhoneQuery, [mobile_no], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        if (results.length > 0) {
            return res.status(400).json({ success: false, message: 'Mobile number already exists' });
        }

        const query = 'INSERT INTO contact_us (name, mobile_no, email, address, description) VALUES (?, ?, ?, ?, ?)';
        const values = [name, mobile_no, email, address, description];

        db.query(query, values, (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            res.status(200).json({ success: true, message: 'Data saved successfully' });
        });
    });
});


//Get Contact-us
router.get('/all-Contact-us', (req, res) => {
    const query = 'SELECT name, mobile_no, email, address, description FROM contact_us ';

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.status(200).json({ success: true, contact_us: results });
    });
})


// DELETE contact 
router.delete('/ContactUs/:email', (req, res) => {
    const { email } = req.params;

    const deleteQuery = 'DELETE FROM contact_us WHERE email = ?';
    db.query(deleteQuery, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Contact not found' });
        }
        res.status(200).json({ success: true, message: 'Contact deleted successfully' });
    });
}); 

module.exports = router;



// const express = require('express');
// const router = express.Router();
// const db = require('./db');
// const multer = require('multer');
// const path = require('path');

// // For file upload
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/');
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + path.extname(file.originalname));
//     }
// });
// const upload = multer({ storage: storage });

// // Register user
// router.post('/registers', upload.single('profile_picture'), (req, res) => {
//     const { name, phoneno, address, email, password } = req.body;
//     const profilePicture = req.file ? req.file.path : null;

//     if (!name || !phoneno || !address || !email || !password) {
//         return res.status(400).json({ success: false, message: 'All fields are required' });
//     }

//     const checkPhoneQuery = 'SELECT * FROM users WHERE phoneno = ?';
//     db.query(checkPhoneQuery, [phoneno], (err, results) => {
//         if (err) {
//             return res.status(500).json({ success: false, message: 'Database error' });
//         }
//         if (results.length > 0) {
//             return res.status(400).json({ success: false, message: 'Phone number already exists' });
//         }

//         const query = 'INSERT INTO users (name, phoneno, address, email, password, profile_picture) VALUES (?, ?, ?, ?, ?, ?)';
//         const values = [name, phoneno, address, email, password, profilePicture];

//         db.query(query, values, (err, results) => {
//             if (err) {
//                 return res.status(500).json({ success: false, message: 'Database error' });
//             }
//             res.status(200).json({ success: true, message: 'User registered successfully' });
//         });
//     });
// });

// // Login user
// router.post('/login', (req, res) => {
//     const { email, password } = req.body;

//     if (!email || !password) {
//         return res.status(400).json({ success: false, message: 'Email and password are required' });
//     }

//     // Query to check user credentials
//     const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
//     const values = [email, password];

//     db.query(query, values, (err, results) => {
//         if (err) {
//             return res.status(500).json({ success: false, message: 'Database error' });
//         }

//         if (results.length > 0) {
//             const user = results[0];

//             const loginQuery = 'INSERT INTO login (email, password, login_time) VALUES (?, ?, NOW())';
//             const loginValues = [email, password];

//             db.query(loginQuery, loginValues, (loginErr) => {
//                 if (loginErr) {
//                     return res.status(500).json({ success: false, message: 'Failed to log login event' });
//                 }
//                 res.status(200).json({ success: true, message: 'Login successful', user });
//             });

//         } else {
//             res.status(401).json({ success: false, message: 'Invalid email or password' });
//         }
//     });
// });

// // Route to handle banner upload
// router.post('/uploadBanner', upload.single('banner'), (req, res) => {
//     try {
//         if (req.file) {
//             const bannerPath = req.file.path;

//             // Insert the banner image path into the database
//             const sql = 'INSERT INTO banners (banner_img) VALUES (?)';
//             db.query(sql, [bannerPath], (err, result) => {
//                 if (err) {
//                     res.status(500).json({ message: 'Database insertion error', error: err.message });
//                     return;
//                 }
//                 res.status(200).json({
//                     message: 'Banner uploaded and saved to database successfully',
//                     filePath: bannerPath,
//                 });
//             });
//         } else {
//             res.status(400).json({ message: 'No file uploaded' });
//         }
//     } catch (error) {
//         res.status(500).json({ message: 'Error uploading banner', error: error.message });
//     }
// });

// module.exports = router;
