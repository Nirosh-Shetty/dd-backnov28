import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletSeting, setWalletSeting] = useState({});

  useEffect(() => {
    fetchWalletData();
    AdminWallet();
  }, []);

  const fetchWalletData = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem("user")); // Assuming user is logged in
      if (!userId) return;

      const walletRes = await axios.get(
        `http://localhost:7013/api/wallet/user/${userId?._id}`
      );
      setWallet(walletRes.data.data?.wallet);

      const transactionsRes = await axios.get(
        `http://localhost:7013/api/wallet/transactions/${userId?._id}`
      );
      setTransactions(transactionsRes.data.data);

      const walseting = await axios.get(
        "http://localhost:7013/api/wallet/getsettings"
      );
      setWalletSeting(walseting.data.success);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      setLoading(false);
    }
  };

  const [AllWallet, setAllWallet] = useState([]);
  const AdminWallet = async () => {
    try {
      const response = await axios.get("http://localhost:7013/api/wallet/all");
      setAllWallet(response.data.success);
    } catch (error) {
      console.error("Error fetching wallets:", error);
    }
  };
  // const [rateorder,setrateorder]=useState({})
  // const [rateMode,setRateMode]=useState(false);
  // const getorderByCustomerId=async()=>{
  //   try {
  //     const userId = JSON.parse(localStorage.getItem("user")) // Assuming user is logged in
  //       if (!userId) return;
  //     let res=await axios.get("http://localhost:7013/api/admin/getorderNotRatedByUserID/"+userId?._id);
  //     if(res.status==200){
  //       setrateorder(res.data.order)
  //       setRateMode(true)
  //     }
  //   } catch (error) {
  //     setRateMode(false)
  //     setrateorder({})

  //     console.log(error);

  //   }
  // }

  // const makeRateOrder=async(id, rate, comement,userId )=>{
  // try {
  //   let res=await axios.put('http://localhost:7013/api/admin/makeRateOfOrder',{
  //     id, rate, comement
  //   });
  //   if(res.status==200){
  //     setrateorder({})
  //     setRateMode(false)
  //   }
  // } catch (error) {
  //   if(error.response){
  //     alert(error.response.data.error)
  //   }
  //   console.log(error);
  // }
  // }

  // const makeRateOrder=async(id, rate, comement,userId )=>{
  // try {
  //   let res=await axios.put('http://localhost:7013/api/admin/makeRateOfOrder',{
  //     id, rate, comement
  //   });
  //   if(res.status==200){
  //     setrateorder({})
  //     setRateMode(false)
  //   }
  // } catch (error) {
  //   if(error.response){
  //     alert(error.response.data.error)
  //   }
  //   console.log(error);
  // }
  // }

  return (
    <WalletContext.Provider
      value={{
        wallet,
        transactions,
        fetchWalletData,
        loading,
        walletSeting,
        AllWallet,
        AdminWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
