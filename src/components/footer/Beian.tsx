import './style.less';
const Beian = () => {
  return (
    <div className="beian">
      <a href="https://beian.miit.gov.cn/">{(window as any).SNConfig.BeiAnHao}</a>
    </div>
  );
};

export default Beian;
