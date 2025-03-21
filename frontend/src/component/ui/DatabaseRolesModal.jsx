import { TrashIcon } from "@heroicons/react/24/outline"
import React, { useState } from "react"
import { updateDocument } from "../../service/DocumentService"
import { createUser, updateUser } from "../../service/UserService"
import "./modal.css"
import { EventEmitter, Events } from "../../eventEmitter"
import { showCollectionContent } from "../../service/CollectionService"

export default function DatabaseRolesModal ({ open, close, user, currentPage, creationMode }) {
  const [userRoles, setUserRoles] = useState(getUserRoles())
  const [isSaveable, setIsSaveable] = useState(false)

  function closeModal () {
    close()
  }

  async function handleSubmit (event) {
    event.preventDefault()
    if (creationMode === false) {
      const dbUser = user
      const selectedRole = event.target.roleSelect.value
      if (selectedRole !== "null") {
        const newRole = {
          role: event.target.roleSelect.value,
          db: "admin"
        }
        dbUser.roles.push(newRole)
      } else {
        dbUser.roles = dbUser.roles.filter((r) =>
          userRoles.includes(r.role)
        )
      }
      await updateDocument(
        dbUser._id,
        JSON.stringify(dbUser),
        currentPage
      )
      const password = event.target.password.value
      if (password && password.length > 0) {
        updateUser(dbUser.user, password)
      }
      const query = sessionStorage.getItem("query")
      const resultData = await showCollectionContent("find", query, currentPage)
      EventEmitter.dispatch(Events.RENDER_RESULT, resultData)
    } else {
      const newRole = {
        role: event.target.roleSelect.value,
        db: "admin"
      }
      const dbUser = {
        user: event.target.username.value,
        password: event.target.password.value,
        roles: [newRole]
      }
      await createUser(dbUser)
      const query = sessionStorage.getItem("query")
      const resultData = await showCollectionContent("find", query, currentPage)
      EventEmitter.dispatch(Events.RENDER_RESULT, resultData)
    }
    close()
  }

  function getUserRoles () {
    const roles = []
    if (user != null) {
      user.roles.forEach((role) => {
        roles.push(role.role)
      })
      return roles
    }
  }

  function deleteRole (index) {
    const tempRoles = [...userRoles]
    tempRoles.splice(index, 1)
    setUserRoles(tempRoles)
  }

  function renderUserRoles () {
    if (userRoles) {
      const listItems = userRoles.map((role, index) => (
                <li key={index}>
                    {role}{" "}
                    <div
                        className="inline"
                        role="button"
                        onClick={() => deleteRole(index)}>
                        <TrashIcon className="w-4 h-4 inline mt-[-3px]" />
                    </div>
                </li>
      ))
      return listItems
    }
  }

  function roleSelectionChanged (element) {
    if (element.target.value !== "null") {
      setIsSaveable(true)
    } else {
      setIsSaveable(false)
    }
  }

  return open === true
    ? (
        <>
            <div className="overlay">
                <div className="modal dark:bg-dark-card">
                    <form
                        onSubmit={handleSubmit}
                        method="post"
                        className="mb-3">
                        {creationMode === false
                          ? <div className="mb-3 text-xl dark:text-dark-text">Edit {user.user}</div>
                          : <div className="mb-3 text-xl dark:text-dark-text">Create new user</div>
                        }
                        {creationMode === false &&
                            <div className="text-start mb-3">
                                <div className="text-xl dark:text-dark-text">Roles</div>
                                <ul className="list-disc ps-6 dark:text-dark-text">{renderUserRoles()}</ul>
                            </div>
                        }
                        <div className="text-start mb-3">
                            <div className="text-xl mb-1 dark:text-dark-text">User details</div>
                            {creationMode === true &&
                                <div className="relative">
                                    <input
                                        className="mb-3 w-full block !rounded-md px-2.5 pb-2 pt-7 text-sm text-gray-900 bg-gray-50 border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer dark:bg-dark-input dark:text-dark-text dark:border-gray-600"
                                        type="text"
                                        name="username"
                                        required/>
                                    <label htmlFor="username" className="absolute text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-3 scale-75 top-5 z-10 origin-[0] start-2.5 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3">Username</label>
                                </div>
                            }
                            <div className="relative">
                                <input
                                    className="w-full block !rounded-md px-2.5 pb-2 pt-7 text-sm text-gray-900 bg-gray-50 border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer dark:bg-dark-input dark:text-dark-text dark:border-gray-600"
                                    type="password"
                                    name="password"
                                    required={creationMode}
                                />
                                <label htmlFor="password" className="absolute text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-3 scale-75 top-5 z-10 origin-[0] start-2.5 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3">Password</label>
                            </div>
                        </div>
                        <div className="text-start">
                        {creationMode === false
                          ? <div className="text-xl mb-1 dark:text-dark-text">Add a role</div>
                          : <div className="text-xl mb-1 dark:text-dark-text">Role</div>
                        }
                            <div className="relative">
                                <select
                                    className="mt-[-1px] w-full pe-8 block appearance-none bg-selectArrow bg-origin-content bg-right-075 bg-no-repeat bg-[length:16px_12px] rounded-md px-2.5 pb-4 pt-7 text-sm text-gray-900 bg-gray-50 border border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600 peer dark:bg-dark-input dark:text-dark-text dark:border-gray-600"
                                    name="roleSelect"
                                    onChange={roleSelectionChanged}>
                                    <option value="null" className="dark:bg-dark-input dark:text-dark-text">
                                        Please select a role
                                    </option>
                                    <option value="read" className="dark:bg-dark-input dark:text-dark-text">read</option>
                                    <option value="readWrite" className="dark:bg-dark-input dark:text-dark-text">readWrite</option>
                                    <option value="readAnyDatabase" className="dark:bg-dark-input dark:text-dark-text">
                                        readAnyDatabase
                                    </option>
                                    <option value="readWriteAnyDatabase" className="dark:bg-dark-input dark:text-dark-text">
                                        readWriteAnyDatabase
                                    </option>
                                    <option value="userAdminAnyDatabase" className="dark:bg-dark-input dark:text-dark-text">
                                        userAdminAnyDatabase
                                    </option>
                                    <option value="dbAdminAnyDatabase" className="dark:bg-dark-input dark:text-dark-text">
                                        dbAdminAnyDatabase
                                    </option>
                                    <option value="root" className="dark:bg-dark-input dark:text-dark-text">root</option>
                                    <option value="dbOwner" className="dark:bg-dark-input dark:text-dark-text">dbOwner</option>
                                    <option value="userAdmin" className="dark:bg-dark-input dark:text-dark-text">userAdmin</option>
                                    <option value="dbAdmin" className="dark:bg-dark-input dark:text-dark-text">dbAdmin</option>
                                    <option value="clusterAdmin" className="dark:bg-dark-input dark:text-dark-text">
                                        clusterAdmin
                                    </option>
                                    <option value="clusterManager" className="dark:bg-dark-input dark:text-dark-text">
                                        clusterManager
                                    </option>
                                    <option value="clusterMonitor" className="dark:bg-dark-input dark:text-dark-text">
                                        clusterMonitor
                                    </option>
                                    <option value="hostManager" className="dark:bg-dark-input dark:text-dark-text">
                                        hostManager
                                    </option>
                                    <option value="backup" className="dark:bg-dark-input dark:text-dark-text">backup</option>
                                    <option value="restore" className="dark:bg-dark-input dark:text-dark-text">restore</option>
                                </select>
                                <label htmlFor="roleSelect" className="absolute text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-6 z-10 origin-[0] start-2.5 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4">Role</label>
                            </div>
                        </div>
                        <p className="dark:text-dark-text">
                            For more information click{" "}
                            <a
                                target="_blank"
                                rel="noreferrer"
                                href="https://www.mongodb.com/docs/manual/reference/built-in-roles/#"
                                className="text-blue-600 dark:text-blue-400 underline inline-block mb-3">
                                here
                            </a>
                        </p>
                        <button
                            className="py-2 px-6 bg-blue-600 text-white rounded-md w-25 m-2 hover:bg-blue-700 dark:hover:bg-blue-500"
                            type="submit"
                            disabled={!isSaveable && creationMode}>
                            Save
                        </button>
                        <button
                            className="py-2 px-6 bg-black/50 text-white rounded-md w-25 m-2 dark:bg-gray-600 hover:bg-black/70 dark:hover:bg-gray-500"
                            onClick={closeModal}>
                            Close
                        </button>
                    </form>
                </div>
            </div>
        </>
      )
    : (
        <></>
      )
}
