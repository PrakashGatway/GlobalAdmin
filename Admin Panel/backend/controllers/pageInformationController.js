const PageInformation = require('../models/PageInformation')
const { paginate } = require('../utils/pagination')

// @desc    Get all page information
// @route   GET /api/page-information?page=1&limit=10
// @access  Private


exports.addSection = async (req, res) => {
  try {
    const { type, data } = req.body

    const page = await PageInformation.findById(req.params.id)
    if (!page) return res.status(404).json({ message: 'Page not found' })

    page.sections.push({
      type,
      data,
      order: page.sections.length + 1,
    })

    await page.save()
    res.json({ success: true, sections: page.sections })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.deleteSection = async (req, res) => {
  const page = await PageInformation.findById(req.params.pageId)
  page.sections.splice(req.params.index, 1)
  await page.save()
  res.json({ success: true })
}

exports.getPage = async (req, res) => {
  const page = await PageInformation.findOne({ slug: req.params.slug })
  res.json(page)
}

exports.getPageInformations = async (req, res) => {
  try {
    const { data, pagination } = await paginate(PageInformation, {}, req)
    
    res.json({
      success: true,
      count: pagination.totalItems,
      pagination,
      data,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get single page information by slug (public)
// @route   GET /api/page-information/public/:slug
// @access  Public
exports.getPageInformationBySlug = async (req, res) => {
  try {
    const page = await PageInformation.findOne({ 
      slug: req.params.slug,
      status: 'Published'
    })
    
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' })
    }
    
    res.json({ success: true, data: page })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get single page information
// @route   GET /api/page-information/:id
// @access  Private
exports.getPageInformation = async (req, res) => {
  try {
    const page = await PageInformation.findById(req.params.id)
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page information not found' })
    }
    res.json({ success: true, data: page })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Create page information
// @route   POST /api/page-information
// @access  Private
exports.createPageInformation = async (req, res) => {
  try {
    const {
      pageType,
      title,
      subTitle,
      slug,
      metaTitle,
      metaDescription,
      status,
      isFeatured,
      heroImage,
      heroImagePublicId,
      roadmapImage,
      roadmapImagePublicId,
      mobileRoadmapImage,
      mobileRoadmapImagePublicId,
      universityCapBg,
      universityCapBgPublicId,
      universitySliderBg,
      universitySliderBgPublicId,
      immigrationServicesBg,
      immigrationServicesBgPublicId,
      sections,
      keywords,
      tags,
      canonicalUrl,
    } = req.body

    // Validate required fields
    if (!title || !slug || !pageType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, slug, and page type',
      })
    }

    // Check if slug already exists
    const existingPage = await PageInformation.findOne({ slug })
    if (existingPage) {
      return res.status(400).json({
        success: false,
        message: 'Page with this slug already exists',
      })
    }

    // Convert keywords and tags from comma-separated string to array
    const keywordsArray = typeof keywords === 'string' 
      ? keywords.split(',').map(k => k.trim()).filter(k => k)
      : Array.isArray(keywords) ? keywords : []
    
    const tagsArray = typeof tags === 'string'
      ? tags.split(',').map(t => t.trim()).filter(t => t)
      : Array.isArray(tags) ? tags : []

    // Create page information
    const pageInformation = await PageInformation.create({
      pageType,
      title,
      subTitle,
      slug,
      metaTitle,
      metaDescription,
      status: status || 'Draft',
      isFeatured: isFeatured || 'No',
      heroImage: heroImage || '',
      heroImagePublicId: heroImagePublicId || '',
      roadmapImage: roadmapImage || '',
      roadmapImagePublicId: roadmapImagePublicId || '',
      mobileRoadmapImage: mobileRoadmapImage || '',
      mobileRoadmapImagePublicId: mobileRoadmapImagePublicId || '',
      universityCapBg: universityCapBg || '',
      universityCapBgPublicId: universityCapBgPublicId || '',
      universitySliderBg: universitySliderBg || '',
      universitySliderBgPublicId: universitySliderBgPublicId || '',
      immigrationServicesBg: immigrationServicesBg || '',
      immigrationServicesBgPublicId: immigrationServicesBgPublicId || '',
      sections: sections || [],
      keywords: keywordsArray,
      tags: tagsArray,
      canonicalUrl: canonicalUrl || '',
    })

    res.status(201).json({
      success: true,
      message: 'Page information created successfully',
      data: pageInformation,
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message)
      const errorDetails = messages.join(', ')
      return res.status(400).json({
        success: false,
        message: `Validation error: ${errorDetails || 'Please check all required fields'}`,
        errors: messages,
      })
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Page with this slug already exists',
      })
    }
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Update page information
// @route   PUT /api/page-information/:id
// @access  Private
exports.updatePageInformation = async (req, res) => {
  try {
    const {
      keywords,
      tags,
      ...updateData
    } = req.body

    // Convert keywords and tags if they are strings
    if (keywords !== undefined) {
      updateData.keywords = typeof keywords === 'string'
        ? keywords.split(',').map(k => k.trim()).filter(k => k)
        : Array.isArray(keywords) ? keywords : []
    }

    if (tags !== undefined) {
      updateData.tags = typeof tags === 'string'
        ? tags.split(',').map(t => t.trim()).filter(t => t)
        : Array.isArray(tags) ? tags : []
    }

    // If slug is being updated, check for uniqueness
    if (updateData.slug) {
      const existingPage = await PageInformation.findOne({
        slug: updateData.slug,
        _id: { $ne: req.params.id }
      })
      if (existingPage) {
        return res.status(400).json({
          success: false,
          message: 'Page with this slug already exists',
        })
      }
    }

    const pageInformation = await PageInformation.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )

    if (!pageInformation) {
      return res.status(404).json({ success: false, message: 'Page information not found' })
    }

    res.json({
      success: true,
      message: 'Page information updated successfully',
      data: pageInformation,
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Page with this slug already exists',
      })
    }
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Delete page information
// @route   DELETE /api/page-information/:id
// @access  Private
exports.deletePageInformation = async (req, res) => {
  try {
    const pageInformation = await PageInformation.findByIdAndDelete(req.params.id)
    if (!pageInformation) {
      return res.status(404).json({ success: false, message: 'Page information not found' })
    }
    res.json({ success: true, message: 'Page information deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get image by slug and image type (public)
// @route   GET /api/page-information/images/:slug/:imageType
// @access  Public
// @param   imageType: heroImage, universityCapBg, universitySliderBg, immigrationServicesBg, roadmapImage
exports.getImageBySlug = async (req, res) => {
  try {
    const { slug, imageType } = req.params
    
    const validImageTypes = ['heroImage', 'universityCapBg', 'universitySliderBg', 'immigrationServicesBg', 'roadmapImage', 'mobileRoadmapImage']
    
    if (!validImageTypes.includes(imageType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid image type. Valid types: ${validImageTypes.join(', ')}`
      })
    }
    
    // In development, allow Draft pages; in production, only Published
    const statusFilter = process.env.NODE_ENV === 'production' 
      ? { status: 'Published' }
      : {}
    
    const page = await PageInformation.findOne({ 
      slug: slug,
      ...statusFilter
    })
    
    if (!page) {
      // Return success with null imageUrl instead of 404 to allow frontend fallback
      return res.json({
        success: true,
        data: {
          imageUrl: null,
          publicId: null,
          imageType,
          slug,
          message: 'Page not found or not published'
        }
      })
    }
    
    const imageUrl = page[imageType] || ''
    const publicId = page[`${imageType}PublicId`] || ''
    
    // Return success even if imageUrl is empty, so frontend can handle fallback
    res.json({
      success: true,
      data: {
        imageUrl: imageUrl || null,
        publicId: publicId || null,
        imageType,
        slug,
        ...(imageUrl ? {} : { message: `Image not found for type: ${imageType}` })
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
