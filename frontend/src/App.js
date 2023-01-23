import React from 'react';
import './App.css';
import { Layout, theme } from 'antd';
import Map from './components/Map';
// import FloatBut from './components/FloatBut';
import HeaderContents from './components/HeaderContents';
import ToolBar from './components/ToolBar';

const { Header, Content, Footer } = Layout;

function App() {

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout className="site-layout">
      <Header
        style={{
          padding: 0,
          background: colorBgContainer,
        }}
      >
        <HeaderContents />
      </Header>
      <Content
        style={{
          margin: 0,
          background: colorBgContainer,
          height: '500px',
        }}
      >
        <Map className="map-layout"/>
        <ToolBar />
      </Content>
      <Footer
        style={{
          textAlign: 'center',
        }}
      >
        IFRC GO MAKE MAPS ©2023
      </Footer>
    </Layout>
  );
}

export default App;
