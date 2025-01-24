import { useLoaderData } from "@remix-run/react";
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useState } from 'react';

import { mockUsers, mockAppointments } from '~/data/mock';
const apiUrl = process.env.API_URL;

export async function loader() {

    // console.log(`${apiUrl}/schedule`)
    // console.log(mockUsers)
    const scheduleResponse = await fetch(`${apiUrl}/schedule`);
    const scheduleData = await scheduleResponse.json();

    const userResponse = await fetch(`${apiUrl}/users`);
    const userData = await userResponse.json();

   
    return {
      appointments: scheduleData.data,
      users: userData.data,
    };
   }

export default function Calendar() {
  const apiUrl = process.env.API_URL
//   const apiUrl = process.env.API_URL || 'http://localhost:8080';
  const {appointments,users } = useLoaderData<typeof loader>();
  const [events, setEvents] = useState(appointments);


const handleDateSelect = async (selectInfo: any) => {
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9998;
    `;
  
    // 修改对话框样式，添加 z-index
    const dialog = document.createElement('div');
  
    // 其余代码保持不变...
    const userSelect = document.createElement('select');
    
    users.forEach(user => {
      const option = document.createElement('option');
      option.value = user.id.toString();
      option.text = user.name;
      userSelect.appendChild(option);
    });

    const gpuSelect = document.createElement('select');
    dialog.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 9999;
    width: 400px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  `;
   
   userSelect.style.cssText = `
    padding: 8px;
    width: 260px;
    margin: 0 auto 16px;
    border: 1px solid rgba(0,0,0,0.2);
    border-radius: 4px;
   `;
   
   gpuSelect.style.cssText = `
    padding: 8px;
    width: 260px;
    margin: 0 auto;
    border: 1px solid rgba(0,0,0,0.2);
    border-radius: 4px;
   `;

    for(let i = 1; i <= 8; i++) {
    const option = document.createElement('option');
    option.value = i.toString();
    option.text = `${i} GPU`;
    gpuSelect.appendChild(option);
}
  
    const title = document.createElement('h3');
    title.style.marginBottom = '24px';
    title.textContent = '请选择用户和GPU数量';
    dialog.appendChild(title);
    dialog.appendChild(userSelect);
    dialog.appendChild(gpuSelect);
  
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = '确认';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '取消';

    confirmBtn.style.cssText = `
    margin: 10px;
    padding: 8px 24px;
    background: #1a73e8;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    `;

    cancelBtn.style.cssText = `
    margin: 10px;
    padding: 8px 24px;
    background: #f1f3f4;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    `;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        margin-top: 20px;
        padding-top: 10px;
        border-top: 1px solid #eee;
        text-align: right;
    `;

    buttonContainer.appendChild(confirmBtn);
    buttonContainer.appendChild(cancelBtn);
    dialog.appendChild(buttonContainer);
    
    // 先添加遮罩层，再添加对话框
    document.body.appendChild(overlay);
    document.body.appendChild(dialog);
  
    const cleanup = () => {
      document.body.removeChild(dialog);
      document.body.removeChild(overlay);
      selectInfo.view.calendar.unselect();
    };
  
    const handleConfirm = async () => {
      const selectedUserId = parseInt(userSelect.value);
      const user = users.find(u => u.id === selectedUserId);
      console.log("user select")
      console.log(user.name)
      if (user) {
        const newEvent = {
            title: `${user.name} (${gpuSelect.value} GPU)`,
            start: new Date(selectInfo.startStr).toISOString(), 
            end: new Date(selectInfo.endStr).toISOString(),
            gpunum: parseInt(gpuSelect.value),
            name: user.name
        };
        try {
            console.log(JSON.stringify(newEvent))
            const response = await fetch(`${apiUrl}/schedule`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newEvent),
          });
          if (response.ok) {
            const savedEvent = await response.json();
            // console.log(savedEvent)
            setEvents([...events, savedEvent.data]);
          } else {
            alert('创建预约失败');
          }
        } catch (error) {
          alert('创建预约时发生错误');
          console.error(error);
        }
      }
      
      cleanup();
    };
  
    confirmBtn.onclick = handleConfirm;
    cancelBtn.onclick = cleanup;
  };

  const handleEventClick = async (clickInfo: any) => {
    console.log('Event clicked:', clickInfo.event); // 添加更详细的日志
    
    if (confirm('是否要删除这个预约?')) {
      try {
        const response = await fetch(`${apiUrl}/schedule/${clickInfo.event.id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setEvents(events.filter(event => event.id !== clickInfo.event.id));
          clickInfo.event.remove();
        } else {
          alert('删除预约失败');
        }
      } catch (error) {
        alert('删除预约时发生错误');
        console.error(error);
      }
    }
  };

  return (
    <div className="bg-white p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">预约日历</h1>
      <div className="bg-white" style={{ height: '600px' }}>
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin, dayGridPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
          }}
          displayEventTime={false}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          locale="zh-cn"
          allDaySlot={false}
        />
      </div>
    </div>
  );
}