import { useState } from 'react';
import { AutoComplete, AutoCompleteProps } from 'antd';
import _ from 'lodash';
import axios from 'axios';

interface PropsType {
  handleSelect: (opt: any) => void;
}

const geocoderUrl = 'http://api.tianditu.gov.cn/geocoder';
const geocoderToken = (window as any).SNConfig.tiandituToken;

const Geocoder = (props: PropsType) => {
  const [options, setOptions] = useState<AutoCompleteProps['options']>([]);

  const handleSearch = _.debounce(async (text: string) => {
    try {
      const url = `${geocoderUrl}?ds={"keyWord":"${text}"}&tk=${geocoderToken}`;
      const { data } = await axios.get(url);
      setOptions([
        {
          label: data.location.keyWord + `(${data.location.level})`,
          value: data.location.keyWord + `(${data.location.level})`,
          location: data.location,
        },
      ]);
    } catch {
      //
    }
  }, 500);
  const handleSelect = (_v: any, opt: any) => {
    props.handleSelect(opt.location);
  };

  return (
    <AutoComplete
      options={options}
      style={{ width: 200 }}
      onSelect={handleSelect}
      onSearch={(text) => handleSearch(text)}
      placeholder="输入地址进行搜索"
      allowClear
      onClear={() => {
        setOptions([]);
        props.handleSelect(undefined);
      }}
    />
  );
};

export default Geocoder;
