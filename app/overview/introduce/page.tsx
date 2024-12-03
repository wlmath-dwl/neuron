export default function Home() {
  return (
    <article className="prose">
      <h1>Cell介绍</h1>
      <p>
        Cell是一个用于互动应用界面开发的web库，它保留了canvas绘制的灵活性和dom模型的便捷性。
        它内置了一个可以缩放平移的场景管理容器和数学坐标系映射方法，还支持了数据模型的关联关系和撤销回退处理
      </p>
      <h1>适用场景</h1>
      <ul>
        <li>图片处理程序</li>
        <li>流程图</li>
        <li>思维导图</li>
        <li>户型图编辑器</li>
        <li>教学白板</li>
      </ul>
    </article>
  );
}
