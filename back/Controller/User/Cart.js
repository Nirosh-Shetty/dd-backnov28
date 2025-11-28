const CustomerModel = require("../../Model/User/Userlist");
const CartModel=require('../../Model/User/Cart');
const cron = require('node-cron');


class Cart{
    async addCart(req, res) {
        try {
            let { userId, items, lastUpdated, username, mobile,companId } = req.body;
 
                if(!items) return res.status(200).json({message:"no item"})
                   if(!items.length) return res.status(200).json({message:"no item"})
            // Check if user has an existing cart
            let existingCart = await CartModel.findOne({ userId,status:"Added" });
    
            if (existingCart) {
        
                    // Otherwise, update the existing cart
                  existingCart=  await CartModel.findOneAndUpdate(
                        { userId },
                      { $set: { items, lastUpdated, abandoned: true, emailSent: false ,companId}},
                        { new: true }
                    );
            
            } else {
                // If no cart exists, create a new one
                existingCart=   await CartModel.create({ userId, items, lastUpdated, username, mobile ,companId});
            }
    
            res.status(200).json({ success: true,data:existingCart?._id ,cartId:existingCart?.cartId});
        } catch (error) {
            console.error("Error saving cart:", error);
            res.status(500).json({ error: "Failed to save cart" });
        }
    }
    
    async getCartbyuser(req,res){
        try {
            const { userId } = req.params;
            const cart = await CartModel.findOne({ userId });
            
            if (!cart) {
              return res.status(200).json({ items: [] });
            }
            
            res.status(200).json({ items: cart.items });
          } catch (error) {
            console.error('Error retrieving cart:', error);
            res.status(500).json({ error: 'Failed to retrieve cart' });
          }
    }

    async getCartCampleted(req,res){
        try {
            const { userId } = req.body;
            
            // Mark cart as not abandoned since purchase completed
            await Cart.findOneAndUpdate(
              { userId },
              { abandoned: false }
            );
            
            res.status(200).json({ success: true });
          } catch (error) {
            console.error('Error updating cart status:', error);
            res.status(500).json({ error: 'Failed to update cart status' });
          }
    }

    async getAllcartaddon(req,res){
        try {
          const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
          const deletedCarts = await CartModel.deleteMany({
              lastUpdated: { $lt: cutoffTime }
          });
          console.log(`Deleted ${deletedCarts.deletedCount} abandoned carts older than 24 hours`);
        let data=await CartModel.find().sort({_id:-1});
        // console.log(data)
        return res.status(200).json({success:data});
        }catch(error){
            console.error('Error retrieving cart:', error);
        }
    }

    async getCartBycompany(req,res){
      try {
        const { companId } = req.params;
        const cart = await CartModel.find({ companId }).sort({_id:-1});
        
        if (!cart) {
          return res.status(200).json({ items: [] });
        }
        
       return res.status(200).json({ items: cart });
      } catch (error) {
        console.error('Error retrieving cart:', error);
        res.status(500).json({ error: 'Failed to retrieve cart' });
      }
    }
}


module.exports=new Cart();
// API Routes

  

  

  
  // Schedule job to send abandoned cart emails (runs every hour)
//   cron.schedule('0 * * * *', async () => {
//     try {
//       // Find abandoned carts updated more than 1 hour ago but less than 24 hours ago
//       // and where reminder email hasn't been sent yet
//       const abandonedCarts = await CartModel.find({
//         abandoned: true,
//         emailSent: false,
//         lastUpdated: {
//           $lt: new Date(Date.now() - 60 * 60 * 1000), // Older than 1 hour
//           $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Not older than 24 hours
//         }
//       });
  
//       // Email configuration
//       const transporter = nodemailer.createTransport({
//         // Your email service configuration
//         service: 'gmail',
//         auth: {
//           user: process.env.EMAIL_USER,
//           pass: process.env.EMAIL_PASS
//         }
//       });
  
//       // Send email for each abandoned cart
//       for (const cart of abandonedCarts) {
//         // Get user email from your user database
//         const user = await CartModel.findOne({ id: cart.userId });
        
//         if (!user || !user.email) continue;
        
//         // Create email content
//         const emailContent = `
//           <h2>You left items in your cart!</h2>
//           <p>We noticed you have the following items in your cart:</p>
//           <ul>
//             ${cart.items.map(item => `<li>${item.name} - $${item.price} x ${item.quantity}</li>`).join('')}
//           </ul>
//           <p>Total: $${cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</p>
//           <p><a href="${process.env.SITE_URL}/cart?recoveryId=${cart._id}">Complete your purchase now</a></p>
//         `;
        
//         // Send email
//         await transporter.sendMail({
//           from: '"Your Store" <noreply@yourstore.com>',
//           to: user.email,
//           subject: 'Complete Your Purchase - Items Waiting in Your Cart',
//           html: emailContent
//         });
        
//         // Mark email as sent
//         cart.emailSent = true;
//         await cart.save();
//       }
//     } catch (error) {
//       console.error('Error processing abandoned carts:', error);
//     }
//   });