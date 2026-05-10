import React, {Dispatch,SetStateAction} from "react";
import { useTranslation } from "react-i18next";
import { Input } from "../ui/input";


interface IProps{
  value:string;
  onchange: Dispatch<SetStateAction<string>>
}
export const SearchInput: React.FC<IProps> = ({onchange,value}) => {
  const {t} = useTranslation('lessons')
  return (

      <div className="relative flex w-full flex-wrap items-stretch  opacity-75">
        <Input
          type="search"
          className="w-[200px] px-4 py-1 bg-white relative m-0 block flex-auto rounded-md "
          placeholder={t('search')}
          aria-label="Search"
          aria-describedby="button-addon2"
          onChange={(el) => onchange(el.target.value)}
          value={value}
        />
        <span
          className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center text-neutral-700 dark:text-neutral-200"
          id="basic-addon2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>

  );
};


