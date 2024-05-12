import UserInfo from "./UserInfo/UserInfo"
import ChatList from "./ChatList/ChatList"
import "./list.css"
const List = ({ currentUser }) =>{
    
    return (
        <div id="list">
            <UserInfo currentUser={currentUser}/>
            <ChatList currentUser={currentUser}/>
        </div>
    )
}
    export default List