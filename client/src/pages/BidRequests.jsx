import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../providers/AuthProvider"
import axios from "axios"
import BidRequestTableRow from "../components/BidRequestTableRow"
import toast from 'react-hot-toast'
const BidRequests = () => {

  const { user } = useContext(AuthContext)

  const [bids, setBids] = useState([])
  useEffect(() => {
    fetchAllbids()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])
  const fetchAllbids = async () => {
    const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/my-bids/${user?.email}?buyer=true`,{withCredentials:true})
    setBids(data)
  }
  console.log(bids);

  const handleStatusChange = async (id, prevStatus, status) => {
    console.table({ id, prevStatus, status })
    // if(prevStatus===status||prevStatus==='Completed'){
    //   return console.log('Not allowed');
      
    // }
try{
const{data}=await axios.patch(`${import.meta.env.VITE_API_URL}/bid-status-update/${id}`,{status})
console.log(data);
toast.success(`status changed to ${status}`)
//refresh ui
fetchAllbids()


}
  catch(err){
    console.log(err);
    toast.error(err.message)
  }}

  return (
    <section className='container px-4 mx-auto my-12'>
      <div className='flex items-center gap-x-3'>
        <h2 className='text-lg font-medium text-gray-800 '>Bid Requests</h2>

        <span className='px-3 py-1 text-xs text-blue-600 bg-blue-100 rounded-full '>
          {bids.length} Requests
        </span>
      </div>

      <div className='flex flex-col mt-6'>
        <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
          <div className='inline-block min-w-full py-2 align-middle md:px-6 lg:px-8'>
            <div className='overflow-hidden border border-gray-200  md:rounded-lg'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th
                      scope='col'
                      className='py-3.5 px-4 text-sm font-normal text-left rtl:text-right text-gray-500'
                    >
                      <div className='flex items-center gap-x-3'>
                        <span>Title</span>
                      </div>
                    </th>
                    <th
                      scope='col'
                      className='py-3.5 px-4 text-sm font-normal text-left rtl:text-right text-gray-500'
                    >
                      <div className='flex items-center gap-x-3'>
                        <span>Email</span>
                      </div>
                    </th>

                    <th
                      scope='col'
                      className='px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500'
                    >
                      <span>Deadline</span>
                    </th>

                    <th
                      scope='col'
                      className='px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500'
                    >
                      <button className='flex items-center gap-x-2'>
                        <span>Price</span>
                      </button>
                    </th>

                    <th
                      scope='col'
                      className='px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500'
                    >
                      Category
                    </th>

                    <th
                      scope='col'
                      className='px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500'
                    >
                      Status
                    </th>

                    <th className='px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200 '>
                  {
                    bids.map(bid => <BidRequestTableRow key={bid._id} handleStatusChange={handleStatusChange} bid={bid}></BidRequestTableRow>)
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BidRequests
