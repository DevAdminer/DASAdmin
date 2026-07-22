import { InfoCircleOutlined } from "@ant-design/icons";
import { Area, Column } from "@ant-design/plots";
import { Col, Progress, Row, Tooltip } from "antd";
import { formatNumber } from "@/utils/format";
import type { DataItem } from "../data";
import useStyles from "../style.style";
import Yuan from "../utils/Yuan";
import ChartCard from "./Charts/ChartCard";
import Field from "./Charts/Field";
import Trend from "./Trend";

const countMap = [
  {
    name: "任务总数",
    key: "taskCount",
  },
  {
    name: "运行中",
    key: "runningCount",
  },
  {
    name: "已失败",
    key: "failedCount",
  },
  {
    name: "今日执行次数",
    key: "todayExecuteCount",
  },
];

const topColResponsiveProps = {
  xs: 24,
  sm: 12,
  md: 12,
  lg: 12,
  xl: 6,
  style: {
    marginBottom: 24,
  },
};
const IntroduceRow = ({
  loading,
  visitData,
}: {
  loading: boolean;
  visitData: DataItem[];
}) => {
  const { styles } = useStyles();
  return (
    <Row gutter={24}>
      {countMap.map((item) => (
        <Col {...topColResponsiveProps} key={item.key}>
          <ChartCard
            variant="borderless"
            title={item.name}
            action={
              <Tooltip title="指标说明">
                <InfoCircleOutlined />
              </Tooltip>
            }
            loading={loading}
            total={formatNumber(126560)}
            footer={
              <Field label="日销售额" value={`￥${formatNumber(12423)}`} />
            }
            contentHeight={46}
          >
            <Trend flag="down">
              日同比
              <span className={styles.trendText}>11%</span>
            </Trend>
          </ChartCard>
        </Col>
      ))}
    </Row>
  );
};
export default IntroduceRow;
