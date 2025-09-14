import { Fragment, useState, useEffect } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

export default function Inputs_Select(props) {
    const { content = [], value, onChange, id } = props;

    // Fallback to first option if no value provided
    const initial = (content.find(opt => opt.value === value) || content[0]);
    const [selected, setSelected] = useState(initial);

    // Keep local state in sync if parent value changes
    useEffect(() => {
        if (!content || !content.length) return;
        const match = content.find(opt => opt.value === value);
        if (match && match.value !== selected?.value) {
            setSelected(match);
        } else if (!value && content[0] && selected?.value !== content[0].value) {
            setSelected(content[0]);
        }
    }, [value, content]);

    const handleChange = (option) => {
        setSelected(option);
        if (typeof onChange === 'function') onChange(option.value);
    };

    return (
        <div className="flex flex-col gap-1 items-start">
            <input readOnly className='hidden' name={id} id={id} value={selected?.value || ''} />

            <Listbox value={selected} onChange={handleChange}>
                <div className="relative">

                    <Listbox.Button className={`font-main relative cursor-default ring-1 ring-inset ring-gray-300 rounded-lg bg-gray-200 py-[14px] p-3 pr-10 text-left focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm w-48`}>
                        <span className="block truncate">{selected?.name || ''}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                            />
                        </span>
                    </Listbox.Button>

                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className={"z-10 font-main absolute w-48 mt-1 max-h-60 overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm w-" + props.spacing}>
                            {content.map((person, personIdx) => (
                                <Listbox.Option
                                    key={personIdx}
                                    className={({ active }) =>
                                        `relative cursor-default select-none py-2 pr-10 pl-4 ${active ? 'bg-plum/25 text-plum' : 'text-gray-900'}`
                                    }
                                    value={person}
                                >
                                    {({ selected }) => (
                                        <>
                                            <span
                                                className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                                            >
                                                {person.name}
                                            </span>
                                            {selected ? (
                                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-plum">
                                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
        </div>
    )
}
