import Example from '../models/Example.js';
import path from 'path';
import fs from 'fs';

// READ: Get all examples with sorting and filtering
export const getExamples = async (req, res) => {
  try {
    const messages = res.locals.messages;
    const sortBy = req.query.sortBy || 'name'; // Default sort by name
    const order = req.query.order === 'desc' ? -1 : 1;
    const { status, startDate, endDate } = req.query;
    let filter = { deleted: { $ne: true } }; // Default filter to exclude deleted items

    // Add status filter if provided (avoid filtering when "All" is selected)
    if (status && (status === 'active' || status === 'inactive')) {
      filter.status = status;
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate); // Greater than or equal to startDate
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate); // Less than or equal to endDate
      }
    }

    const examples = await Example.find(filter)
      .sort({ [sortBy]: order }); // Dynamic sorting

    res.render('index', { examples, status, startDate, endDate, messages });
  } catch (err) {
    console.error('Error fetching examples:', err.message);
    res.status(500).send('Server Error');
  }
};

// CREATE: Add a new example with an image
export const createExample = async (req, res) => {
  try {
    const { name, description } = req.body;
    const image = req.file ? req.file.filename : null;

    const newExample = new Example({ 
      name, 
      description, 
      image 
    });

    await newExample.save();

    req.flash('success', 'Example created successfully!');
    res.redirect('/');
  } catch (err) {
    req.flash('error', 'Error creating example.');
    res.redirect('/');
  }
};

// UPDATE: Edit an example with a new image (if provided)
export const updateExample = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const example = await Example.findById(id);
    if (!example) {
      req.flash('error', 'Example not found.');
      return res.redirect('/');
    }

    // Prepare the update object
    let updateData = { 
      name, 
      description, 
      status: status === 'active' ? 'active' : 'inactive' 
    };

    // Handle new image upload
    if (req.file) {
      // Delete the old image if it exists
      if (example.image) {
        const oldImagePath = path.join('uploads', example.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);  // Remove old image file
        }
      }
      updateData.image = req.file.filename;  // Save new image filename
    }

    await Example.findByIdAndUpdate(id, updateData, { new: true });

    req.flash('success', 'Example updated successfully!');
    res.redirect('/');
  } catch (err) {
    req.flash('error', 'Error updating example.');
    res.redirect('/');
  }
};

// SOFT DELETE: Remove an example by ID
export const deleteExample = async (req, res) => {
  try {
    const { id } = req.params;
    //await Example.findByIdAndDelete(id);
    await Example.findByIdAndUpdate(id, { deleted: true }, { new: true });
    
    req.flash('success', 'Example moved to trash.');
    //console.log('Flash message set:', req.flash('success'));
    res.redirect('/');
  } catch (err) {
    req.flash('error', 'Error deleting example.');
    res.redirect('/');
  }
};

// SEARCH: Search for examples based on name or description
export const searchExamples = async (req, res) => {
  try {
    const query = req.query.q;
    const searchResults = await Example.find({
      deleted: { $ne: true },
      $or: [
        { name: { $regex: query, $options: 'i' } }, // Case-insensitive name search
        { description: { $regex: query, $options: 'i' } }, // Case-insensitive description search
      ],
    });

    res.render('index', { examples: searchResults });
  } catch (err) {
    console.error('Error searching examples:', err.message);
    res.status(500).send('Server Error');
  }
};

// AGGREGATION: Get aggregated statistics
export const aggregateExamples = async (req, res) => {
  try {
    const aggregationResults = await Example.aggregate([
      {
        $match: { deleted: { $ne: true } },
      },
      {
        $group: {
          _id: '$status',
          total: { $sum: 1 }, // Count documents by status
          avgNameLength: { $avg: { $strLenCP: '$name' } }, // Calculate average name length
        },
      },
      {
        $sort: { total: -1 }, // Sort by count descending
      },
    ]);

    res.render('aggregate', { aggregationResults });
  } catch (err) {
    console.error('Error aggregating examples:', err.message);
    res.status(500).send('Server Error');
  }
};

// SHOW DELETED EXAMPLES
export const getDeletedExamples = async (req, res) => {
  try {
    const messages = res.locals.messages;
    const deletedExamples = await Example.find({ deleted: true }).sort({ createdAt: -1 });

    res.render('trash', { deletedExamples, messages });
  } catch (err) {
    console.error('Error fetching deleted examples:', err.message);
    res.status(500).send('Server Error');
  }
};

// RESTORE DELETED EXAMPLES
export const restoreExample = async (req, res) => {
  try {
    const { id } = req.params;
    await Example.findByIdAndUpdate(id, { deleted: false }, { new: true });

    req.flash('success', 'Example restored successfully.');
    res.redirect('/trash');
  } catch (err) {
    req.flash('error', 'Error restoring example.');
    res.redirect('/trash');
  }
};

export const permanentDeleteExample = async (req, res) => {
  try {
    const { id } = req.params;
    await Example.findByIdAndDelete(id);

    req.flash('success', 'Example permanently deleted.');
    res.redirect('/trash');
  } catch (err) {
    req.flash('error', 'Error permanently deleting example.');
    res.status(500).send('Server Error');
  }
};
