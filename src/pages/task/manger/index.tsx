import { EllipsisOutlined } from "@ant-design/icons";
import { GridContent } from "@ant-design/pro-components";
import { useQuery } from "@tanstack/react-query";
import { Col, Dropdown, Row } from "antd";
import type { RangePickerProps } from "antd/es/date-picker";
import type { Dayjs } from "dayjs";
import type { FC } from "react";
import { Suspense, useState } from "react";
import IntroduceRow from "./components/IntroduceRow";
import OfflineData from "./components/OfflineData";
import PageLoading from "./components/PageLoading";
import TableList from "./components/TableList";
import type { TimeType } from "./components/SalesCard";
import type { AnalysisData } from "./data";
import { fakeChartData } from "./service";
import useStyles from "./style.style";
import { getTimeDistance } from "./utils/utils";

type RangePickerValue = RangePickerProps["value"];
type AnalysisProps = {
  dashboardAndanalysis: AnalysisData;
  loading: boolean;
};
type SalesType = "all" | "online" | "stores";
const Analysis: FC<AnalysisProps> = () => {
  const { styles } = useStyles();
  const [salesType, setSalesType] = useState<SalesType>("all");
  const [currentTabKey, setCurrentTabKey] = useState<string>("");
  const [rangePickerValue, setRangePickerValue] = useState<RangePickerValue>(
    () => getTimeDistance("year")
  );
  const { isLoading: loading, data } = useQuery({
    queryKey: ["dashboard-analysis"],
    queryFn: () => fakeChartData().then((res) => res.data),
  });
  const selectDate = (type: TimeType) => {
    setRangePickerValue(getTimeDistance(type));
  };
  const handleRangePickerChange = (value: RangePickerValue) => {
    setRangePickerValue(value);
  };
  const isActive = (type: TimeType) => {
    if (!rangePickerValue) {
      return "";
    }
    const value = getTimeDistance(type);
    if (!value) {
      return "";
    }
    if (!rangePickerValue[0] || !rangePickerValue[1]) {
      return "";
    }
    if (
      rangePickerValue[0].isSame(value[0] as Dayjs, "day") &&
      rangePickerValue[1].isSame(value[1] as Dayjs, "day")
    ) {
      return styles.currentDate;
    }
    return "";
  };

  let salesPieData: any;
  if (salesType === "all") {
    salesPieData = data?.salesTypeData;
  } else {
    salesPieData =
      salesType === "online"
        ? data?.salesTypeDataOnline
        : data?.salesTypeDataOffline;
  }

  const renderDropdownGroup = () => (
    <span className={styles.iconGroup}>
      <Dropdown
        menu={{
          items: [
            {
              key: "1",
              label: "操作一",
            },
            {
              key: "2",
              label: "操作二",
            },
          ],
        }}
        placement="bottomRight"
      >
        <EllipsisOutlined />
      </Dropdown>
    </span>
  );
  const handleChangeSalesType = (value: SalesType) => {
    setSalesType(value);
  };
  const handleTabChange = (key: string) => {
    setCurrentTabKey(key);
  };
  const activeKey = currentTabKey || data?.offlineData[0]?.name || "";
  return (
    <GridContent>
      <Suspense fallback={<PageLoading />}>
        <IntroduceRow loading={loading} visitData={data?.visitData || []} />
      </Suspense>

      <Suspense fallback={<PageLoading />}>
        <TableList />
      </Suspense>
    </GridContent>
  );
};
export default Analysis;
