const Report = require('../../Model/Admin/OfferReports');

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ orderDate: -1 });
    res.status(200).json({ data: reports });
  } catch (error) {
    console.error('Error fetching reports:', error.message);
    res.status(500).json({ message: 'Error fetching reports' });
  }
};

exports.createReport=async(req,res)=>{
    try {
        let {customerName,phone,totalOrders,product,cartValue,offerPrice,location}=req.body;
        await Report.create({customerName,phone,totalOrders,product,cartValue,offerPrice,location});

        return res.status(200).json({data:"Success"})
    } catch (error) {
        console.log(error);
        
    }
}
exports.exportReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ orderDate: -1 });
    const csv = [
      'Customer Name,Phone,Order Date,Total Orders,Product,Cart Value,Offer Price,location',
      ...reports.map(r =>
        `${r.customerName},${r.phone},${r.orderDate.toISOString()},${r.totalOrders},${r.product},${r.cartValue},${r.offerPrice}`
      ),
    ].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=reports.csv');
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting reports:', error.message);
    res.status(500).json({ message: 'Error exporting reports' });
  }
};

