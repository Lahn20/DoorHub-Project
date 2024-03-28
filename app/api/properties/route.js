import connectDB from "@/config/database";
import Property from '@/models/Property';
import { getSessionUser } from "@/utils/getSessionUser";
import cloudinary from "@/config/cloudinary";


// GET /api/properties
export const GET = async (request) => {
  try {
    await connectDB();

    const properties = await Property.find({});

    return Response.json(properties);

  } catch (error) {
    console.log(error);
    return new Response('Something Went Wrong',{
    status: 500 });
  }
};


// POST /api/properties
export const POST = async (request) => {
  try {
    await connectDB();

    // Access user id
    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.userId) {
      return new Response('User ID is required', {status: 401});
    }

    const { userId } = sessionUser;


    // Access all values from amenities and images
    const formData = await request.formData();
    const amenities = formData.getAll('amenities');
    const images = formData.getAll('images').filter((image) => image.name !== '');

    // Create propertyData object for database
    const newPropertyData = {
      type: formData.get('type'),
      name: formData.get('name'),
      description: formData.get('description'),
      location: {
        street: formData.get('location.street'),
        city: formData.get('location.city'),
        state: formData.get('location.state'),
        zipcode: formData.get('location.zipcode'),
      },
      beds: formData.get('beds'),
      baths: formData.get('baths'),
      square_feet: formData.get('square_feet'),
      amenities,
      rates: {
        weekly: formData.get('rates.weekly'),
        monthly: formData.get('rates.monthly'),
        nightly: formData.get('rates.nightly.'),
      },
      seller_info: {
        name: formData.get('seller_info.name'),
        email: formData.get('seller_info.email'),
        phone: formData.get('seller_info.phone'),
      },
      owner: userId
    };


    // Upload image(s) to Cloudinary
    const imageUrls = [];

    for (const image of images) {
      const imageBuffer = await image.arrayBuffer();
      const imageArray = Array.from(new Uint8Array(imageBuffer));
      const imageData = Buffer.from(imageArray);

      // Convert image data to base64
      const imageBase64 = imageData.toString('base64');

      // Make request to upload to Cloudinary
      const result = await cloudinary.uploader.upload(
        `data:image/png;base64,${imageBase64}`, 
        {
          folder:'doorpulse'
        }
      );

      imageUrls.push(result.secure_url);
    }

    // Add image array to newPropertyData object
    newPropertyData.images = imageUrls;

    // Upload newPropertyData object to database
    const newProperty = new Property(newPropertyData);
    await newProperty.save();

    return Response.redirect(`${process.env.NEXTAUTH_URL}/properties/${newProperty._id}`);
    

   // return new Response(JSON.stringify({message:'Success'}),
   // { status: 200 });
    } catch (error) {
      return new Response('Failed to add property', { status:500 });
  }
};